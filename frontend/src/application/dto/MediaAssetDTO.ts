export type MediaMimeDTO = 'image/jpeg' | 'image/png' | 'image/webp';
export interface MediaAssetDTO {
  id: number;
  url: string;
  width: number;
  height: number;
  mime_type: MediaMimeDTO;
  credit: string;
  source_url: string;
  created_at: string;
}
export interface ImageUseDTO {
  asset: MediaAssetDTO;
  alt_text: string;
  caption: string;
}
export interface ImageUseInputDTO {
  asset_id: number;
  alt_text: string;
  caption: string;
}
