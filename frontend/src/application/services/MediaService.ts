import { rejectContent } from '../../domain/models/ContentResult';
import { isSupportedImageMime } from '../../domain/models/MediaAsset';
import type { ContentRepository } from '../../domain/ports/ContentRepository';
import type { MediaController } from '../../domain/ports/MediaController';
import type { MediaState } from '../../domain/models/MediaAsset';
import type { Session } from '../../domain/ports/Session';
import type { UIAlerts } from '../../domain/ports/UIAlerts';
import { reportContentFailure } from '../alerts/reportContentFailure';
import { Store } from './Store';

// Uploads create reusable assets. Associating an asset with content is a later save.
export class MediaService extends Store<MediaState> implements MediaController {
  constructor(
    private repository: Pick<ContentRepository, 'upload'>,
    private alerts: UIAlerts,
    private session: Pick<Session, 'getSnapshot' | 'expire' | 'revision'>,
  ) {
    super({ uploading: false });
  }
  upload: MediaController['upload'] = async (input) => {
    if (this.getSnapshot().uploading)
      return rejectContent('An image upload is already in progress.');
    if (!isSupportedImageMime(input.file.type) || input.file.size === 0) {
      const result = rejectContent(
        'Choose a nonempty JPEG, PNG, or WebP image.',
      );
      reportContentFailure(
        result.error,
        this.alerts,
        this.session,
        this.session.getSnapshot().path,
        this.session.revision(),
      );
      return result;
    }
    const returnTo = this.session.getSnapshot().path;
    this.patch({ uploading: true });
    const revision = this.session.revision();
    try {
      const result = await this.repository.upload(input);
      if (!result.ok)
        reportContentFailure(
          result.error,
          this.alerts,
          this.session,
          returnTo,
          revision,
          true,
        );
      return result;
    } catch {
      const result = rejectContent(
        'Could not upload this image. Please try again.',
      );
      reportContentFailure(
        result.error,
        this.alerts,
        this.session,
        returnTo,
        revision,
      );
      return result;
    } finally {
      this.patch({ uploading: false });
    }
  };
}
