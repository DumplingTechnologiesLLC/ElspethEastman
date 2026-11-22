export enum MediaMime {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  WebP = 'image/webp',
}

export function isSupportedImageMime(value: string): value is MediaMime {
  return Object.values(MediaMime).some((mime) => mime === value);
}

export interface MediaAsset {
  readonly id: string;
  readonly url: string;
  readonly width: number;
  readonly height: number;
  readonly mimeType: MediaMime;
  readonly credit: string;
  readonly sourceUrl: string;
  readonly createdAt: string;
}
export interface ImageUse {
  readonly asset: MediaAsset;
  readonly altText: string;
  readonly caption: string;
}
export interface ImageUseInput {
  readonly assetId: string;
  readonly altText: string;
  readonly caption: string;
}
export interface MediaUploadInput {
  readonly file: File;
  readonly credit: string;
  readonly sourceUrl: string;
}
export interface MediaState {
  readonly uploading: boolean;
}
