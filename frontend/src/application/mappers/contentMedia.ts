import { MediaMime } from '../../domain/models/MediaAsset';
import type { ImageUse, MediaAsset } from '../../domain/models/MediaAsset';
import type {
  ImageUseDTO,
  MediaAssetDTO,
  MediaMimeDTO,
} from '../dto/MediaAssetDTO';

const mimeTypes = {
  'image/jpeg': MediaMime.JPEG,
  'image/png': MediaMime.PNG,
  'image/webp': MediaMime.WebP,
} as const satisfies Record<MediaMimeDTO, MediaMime>;

export function toMediaAsset(dto: MediaAssetDTO): MediaAsset {
  if (!Object.hasOwn(mimeTypes, dto.mime_type))
    throw new Error('Unsupported image format');
  const mimeType = mimeTypes[dto.mime_type];
  return {
    id: dto.id,
    url: dto.url,
    width: dto.width,
    height: dto.height,
    mimeType,
    credit: dto.credit,
    sourceUrl: dto.source_url,
    createdAt: dto.created_at,
  };
}
export function toImageUse(dto: ImageUseDTO): ImageUse {
  return {
    asset: toMediaAsset(dto.asset),
    altText: dto.alt_text,
    caption: dto.caption,
  };
}
