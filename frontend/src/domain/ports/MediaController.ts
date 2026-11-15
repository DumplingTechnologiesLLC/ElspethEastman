import type { ContentResult } from '../models/ContentResult';
import type {
  MediaAsset,
  MediaUploadInput,
  MediaState,
} from '../models/MediaAsset';
import type { Readable } from './Readable';

export interface MediaController extends Readable<MediaState> {
  upload: (input: MediaUploadInput) => Promise<ContentResult<MediaAsset>>;
}
