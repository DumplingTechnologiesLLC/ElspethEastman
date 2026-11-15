import type { ContentFailure } from '../../domain/models/ContentResult';
import type { ContentFailureDTO } from '../dto/ContentFailureDTO';

const fieldNames = new Map<string, string>([
  ['page_id', 'pageId'],
  ['primary_action', 'primaryAction'],
  ['asset_id', 'assetId'],
  ['alt_text', 'altText'],
  ['source_url', 'sourceUrl'],
  ['artwork_title', 'artworkTitle'],
  ['published_at', 'publishedAt'],
  ['entry_id', 'entryId'],
  ['ordered_ids', 'orderedIds'],
  ['sort_order', 'sortOrder'],
  ['is_featured', 'isFeatured'],
  ['item_id', 'itemId'],
  ['non_field_errors', 'form'],
]);

function domainFieldPath(path: string): string {
  return path
    .split('.')
    .map((part) => fieldNames.get(part) ?? part)
    .join('.');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isMessages(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((message: unknown) => typeof message === 'string')
  );
}

function readFailure(body: unknown): ContentFailureDTO {
  if (!isRecord(body)) return {};
  const pairs: [string, string[]][] = [];
  if (isRecord(body.fields)) {
    for (const [key, messages] of Object.entries(body.fields)) {
      if (isMessages(messages))
        pairs.push([domainFieldPath(key), [...messages]]);
    }
  }
  return {
    ...(typeof body.detail === 'string' ? { detail: body.detail } : {}),
    fields: Object.fromEntries(pairs),
  };
}

export function toContentFailure(
  status: number | null,
  body: unknown,
): ContentFailure {
  const dto = readFailure(body);
  return {
    status,
    detail:
      dto.detail ??
      (status === null
        ? 'Could not connect. Please try again.'
        : 'The request failed. Please try again.'),
    fields: dto.fields ?? {},
  };
}
