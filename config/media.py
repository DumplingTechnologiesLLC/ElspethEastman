import os


def media_settings(env, base_dir, deployment_env):
    """Keep mutable uploads separate from WhiteNoise's immutable build assets."""
    bucket = env("MEDIA_STORAGE_BUCKET", default="")
    persistent_required = deployment_env in ("production", "staging")
    enabled = env.bool("MEDIA_UPLOADS_ENABLED", default=bool(bucket) or not persistent_required)
    if enabled and persistent_required and not bucket:
        raise ValueError("Staging and production uploads require MEDIA_STORAGE_BUCKET")
    max_bytes = env.int("MEDIA_UPLOAD_MAX_BYTES", default=10 * 1024 * 1024)
    if max_bytes < 1:
        raise ValueError("MEDIA_UPLOAD_MAX_BYTES must be positive")
    storage = {"BACKEND": "django.core.files.storage.FileSystemStorage"}
    if bucket:
        storage = {"BACKEND": "storages.backends.s3.S3Storage", "OPTIONS": {
            "bucket_name": bucket,
            "region_name": env("MEDIA_STORAGE_REGION", default="us-east-1"),
            "endpoint_url": env("MEDIA_STORAGE_ENDPOINT", default=None),
            "custom_domain": env("MEDIA_PUBLIC_HOST", default=None),
            "location": "portfolio",
            "default_acl": None,
            "querystring_auth": False,
            "file_overwrite": False,
            "object_parameters": {"CacheControl": "public, max-age=31536000, immutable"},
        }}
    return {
        "MEDIA_ROOT": env("MEDIA_ROOT", default=os.path.join(base_dir, ".media")),
        "MEDIA_URL": "/media/",
        "MEDIA_UPLOADS_ENABLED": enabled,
        "MEDIA_UPLOAD_MAX_BYTES": max_bytes,
        "storage": storage,
    }
