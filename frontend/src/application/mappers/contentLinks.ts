import type { Link } from '../../domain/models/Link';
import type { LinkDTO } from '../dto/LinkDTO';

export function toLink(dto: LinkDTO): Link {
  return { label: dto.label, href: dto.href, isExternal: dto.is_external };
}
export function toOptionalLink(dto: LinkDTO | null): Link | null {
  return dto === null ? null : toLink(dto);
}
