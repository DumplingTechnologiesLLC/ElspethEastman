CMS uploads use Django's default storage independently of compiled assets. Local development, CI, and Review Apps use a disposable `.media/` directory; those files disappear when a Review App is replaced. Staging and production default to uploads disabled until a persistent bucket is configured. Enabling uploads there without a bucket fails configuration immediately.

Configure the deployment environment before enabling uploads:

- `MEDIA_UPLOADS_ENABLED=True`
- `MEDIA_STORAGE_BUCKET`: an environment-specific S3 or S3-compatible bucket
- `MEDIA_STORAGE_REGION`: defaults to `us-east-1`
- `MEDIA_STORAGE_ENDPOINT`: optional S3-compatible endpoint URL
- `MEDIA_PUBLIC_HOST`: optional public CDN hostname, without a scheme or path
- Standard AWS credentials or a workload role restricted to that environment's bucket and `portfolio/` prefix
- `MEDIA_UPLOAD_MAX_BYTES`: positive byte limit, default 10 MiB

The bucket or CDN must permit public image reads under `portfolio/`. The application does not create buckets, change access policy, or provision credentials. Uploaded names are generated UUIDs; objects are never overwritten. Storage returns browser URLs without expiring query credentials. Build assets, including packaged seed artwork, continue through WhiteNoise. Django serves `/media/` only in disposable environments and returns 404 there in staging/production.

Uploads are authenticated multipart requests. The server decodes and verifies JPEG, PNG, and WebP images, checks the declared MIME type, rejects unsafe dimensions or oversized files, and stores verified dimensions. An upload creates an unattached asset; saving its owning page/card attaches it separately. Canceling an editor does not replace the current image. Asset cleanup must account for reuse before deleting any file.

Before rollout, verify upload, attachment, and public retrieval against the staging bucket, then replace/restart the staging app and confirm retrieval still succeeds. This PR only adds configuration and code; it provisions no infrastructure and changes no live environment settings.
