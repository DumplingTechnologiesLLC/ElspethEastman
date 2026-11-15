from io import BytesIO
import os
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import SimpleTestCase, TestCase, override_settings
import environ
from PIL import Image
from rest_framework.authtoken.models import Token

from config.media import media_settings
from portfolio.models import MediaAsset


def image_file(image_format="PNG", content_type="image/png", name="portrait.png"):
    data = BytesIO()
    Image.new("RGB", (8, 6), color="red").save(data, format=image_format)
    return SimpleUploadedFile(name, data.getvalue(), content_type=content_type)


class MediaUploadTests(TestCase):
    def setUp(self):
        directory = TemporaryDirectory(prefix="elspeth-media-test-")
        self.addCleanup(directory.cleanup)
        self.root = Path(directory.name)
        settings = override_settings(MEDIA_ROOT=directory.name, MEDIA_UPLOADS_ENABLED=True)
        settings.enable()
        self.addCleanup(settings.disable)
        token = Token.objects.create(user=get_user_model().objects.create_user("image-editor"))
        self.headers = {"HTTP_AUTHORIZATION": f"Token {token.key}"}

    def upload(self, file, **fields):
        return self.client.post("/api/media-assets/", {"file": file, **fields}, **self.headers)

    def assert_file_error(self, response):
        self.assertEqual(response.status_code, 400, response.content)
        self.assertIn("file", response.json()["fields"])
        self.assertEqual(MediaAsset.objects.count(), 0)
        self.assertEqual(list(self.root.rglob("*")), [])

    def test_supported_images_are_verified_stored_and_publicly_readable(self):
        for image_format, mime, suffix in (("PNG", "image/png", "png"), ("JPEG", "image/jpeg", "jpg"), ("WEBP", "image/webp", "webp")):
            with self.subTest(image_format=image_format):
                response = self.upload(image_file(image_format, mime, "untrusted-name.svg"), credit="Photographer", source_url="https://example.invalid/source")
                self.assertEqual(response.status_code, 201, response.content)
                record = response.json()
                self.assertEqual((record["width"], record["height"], record["mime_type"]), (8, 6, mime))
                self.assertEqual(record["credit"], "Photographer")
                self.assertEqual(record["source_url"], "https://example.invalid/source")
                self.assertRegex(record["url"], rf"^/media/uploads/[a-f0-9]{{32}}\.{suffix}$")
                asset = MediaAsset.objects.get(pk=record["id"])
                self.assertTrue(self.root.joinpath(asset.file.name).is_file())
                retrieved = self.client.get(record["url"])
                self.assertEqual(retrieved.status_code, 200)
                with Image.open(BytesIO(b"".join(retrieved.streaming_content))) as stored:
                    self.assertEqual(stored.size, (8, 6))
        self.assertEqual(MediaAsset.objects.count(), 3)

    def test_optional_attribution_defaults_and_generated_names_do_not_overwrite(self):
        first, second = self.upload(image_file()).json(), self.upload(image_file()).json()
        self.assertEqual(first["credit"], "")
        self.assertEqual(first["source_url"], "")
        self.assertNotEqual(first["url"], second["url"])
        self.assertEqual(len(list(self.root.joinpath("uploads").iterdir())), 2)

    def test_uploads_reject_missing_empty_oversized_and_unsupported_files(self):
        self.assert_file_error(self.client.post("/api/media-assets/", {}, **self.headers))
        self.assert_file_error(self.upload(SimpleUploadedFile("empty.png", b"", content_type="image/png")))
        with override_settings(MEDIA_UPLOAD_MAX_BYTES=10):
            self.assert_file_error(self.upload(image_file()))
        self.assert_file_error(self.upload(image_file("GIF", "image/gif")))
        self.assert_file_error(self.upload(SimpleUploadedFile("image.svg", b'<svg xmlns="http://www.w3.org/2000/svg"/>', content_type="image/svg+xml")))

    def test_forged_mime_and_truncated_images_are_rejected_before_storage(self):
        self.assert_file_error(self.upload(image_file(content_type="image/jpeg")))
        damaged = image_file("JPEG", "image/jpeg")
        self.assert_file_error(self.upload(SimpleUploadedFile("broken.jpg", damaged.read()[:-30], content_type="image/jpeg")))

    def test_decompression_warning_and_bomb_error_are_rejected(self):
        for limit in (25, 10):
            with self.subTest(limit=limit), patch.object(Image, "MAX_IMAGE_PIXELS", limit):
                self.assert_file_error(self.upload(image_file()))

    def test_attribution_validates_urls_and_unknown_fields_are_rejected(self):
        response = self.upload(image_file(), source_url="javascript:alert(1)")
        self.assertEqual(response.status_code, 400)
        self.assertIn("source_url", response.json()["fields"])
        response = self.upload(image_file(), width=1000)
        self.assertEqual(response.status_code, 400)
        self.assertIn("width", response.json()["fields"])

    def test_failed_database_save_removes_the_unattached_file(self):
        with patch.object(MediaAsset, "save", side_effect=RuntimeError("Database unavailable")):
            with self.assertRaisesMessage(RuntimeError, "Database unavailable"):
                self.upload(image_file())
        self.assertEqual(list(self.root.rglob("*.*")), [])
        self.assertEqual(MediaAsset.objects.count(), 0)

    def test_upload_requires_authentication_and_enabled_environment(self):
        self.assertEqual(self.client.post("/api/media-assets/", {"file": image_file()}).status_code, 403)
        with override_settings(MEDIA_UPLOADS_ENABLED=False):
            response = self.upload(image_file())
            self.assertEqual(response.status_code, 503)
            self.assertIn("detail", response.json())
        self.assertEqual(self.client.get("/api/media-assets/").status_code, 405)

    def test_persistent_deployments_never_serve_local_files(self):
        response = self.upload(image_file())
        for environment in ("staging", "production"):
            with self.subTest(environment=environment), override_settings(DEPLOYMENT_ENV=environment):
                self.assertEqual(self.client.get(response.json()["url"]).status_code, 404)
        self.assertEqual(self.client.get("/media/missing.png").status_code, 404)
        self.assertEqual(self.client.get("/media/../manage.py").status_code, 400)


class MediaConfigurationTests(SimpleTestCase):
    def configuration(self, environment, **values):
        defaults = {"MEDIA_STORAGE_BUCKET": "", "MEDIA_UPLOADS_ENABLED": "", "MEDIA_UPLOAD_MAX_BYTES": "10485760"}
        defaults.update(values)
        if defaults["MEDIA_UPLOADS_ENABLED"] == "":
            del defaults["MEDIA_UPLOADS_ENABLED"]
        with patch.dict(os.environ, defaults):
            return media_settings(environ.Env(), "/app", environment)

    def test_disposable_environments_use_local_storage_and_ten_megabyte_limit(self):
        for environment in ("development", "ci", "review"):
            settings = self.configuration(environment)
            self.assertTrue(settings["MEDIA_UPLOADS_ENABLED"])
            self.assertEqual(settings["storage"]["BACKEND"], "django.core.files.storage.FileSystemStorage")
            self.assertEqual(settings["MEDIA_UPLOAD_MAX_BYTES"], 10 * 1024 * 1024)
            self.assertEqual(settings["MEDIA_ROOT"], "/app/.media")

    def test_staging_and_production_require_persistent_storage_before_enabling_uploads(self):
        for environment in ("staging", "production"):
            self.assertFalse(self.configuration(environment)["MEDIA_UPLOADS_ENABLED"])
            with self.assertRaisesRegex(ValueError, "require MEDIA_STORAGE_BUCKET"):
                self.configuration(environment, MEDIA_UPLOADS_ENABLED="True")

    def test_s3_compatible_storage_keeps_static_assets_independent(self):
        result = self.configuration("staging", MEDIA_STORAGE_BUCKET="staging-images", MEDIA_STORAGE_REGION="eu-west-1",
                                    MEDIA_STORAGE_ENDPOINT="https://storage.example.invalid", MEDIA_PUBLIC_HOST="images.example.invalid")
        self.assertTrue(result["MEDIA_UPLOADS_ENABLED"])
        self.assertEqual(result["storage"]["BACKEND"], "storages.backends.s3.S3Storage")
        options = result["storage"]["OPTIONS"]
        self.assertEqual(options["bucket_name"], "staging-images")
        self.assertEqual(options["region_name"], "eu-west-1")
        self.assertEqual(options["endpoint_url"], "https://storage.example.invalid")
        self.assertEqual(options["custom_domain"], "images.example.invalid")
        self.assertEqual(options["location"], "portfolio")
        self.assertFalse(options["querystring_auth"])
        self.assertFalse(options["file_overwrite"])

    def test_upload_limit_must_be_positive(self):
        with self.assertRaisesRegex(ValueError, "must be positive"):
            self.configuration("ci", MEDIA_UPLOAD_MAX_BYTES="0")
