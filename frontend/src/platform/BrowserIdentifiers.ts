import type { IdentifierSource } from '../domain/ports/IdentifierSource';
export class BrowserIdentifiers implements IdentifierSource {
  constructor(private crypto: Pick<Crypto, 'randomUUID'>) {}
  next = () => this.crypto.randomUUID();
}
