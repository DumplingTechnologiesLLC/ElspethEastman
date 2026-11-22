import type { TokenStorage } from '../domain/ports/TokenStorage';
export class BrowserTokenStorage implements TokenStorage {
  private generation = 0;
  private observed: string | null;
  constructor(
    private browser: Window,
    private key: string,
  ) {
    this.observed = browser.sessionStorage.getItem(key);
  }
  read = () => {
    const token = this.browser.sessionStorage.getItem(this.key);
    if (token !== this.observed) {
      this.observed = token;
      this.generation++;
    }
    return token;
  };
  revision = () => {
    this.read();
    return this.generation;
  };
  write = (token: string | null) => {
    if (token) this.browser.sessionStorage.setItem(this.key, token);
    else this.browser.sessionStorage.removeItem(this.key);
    this.observed = token;
    this.generation++;
  };
  listen = (callback: () => void) => {
    this.browser.addEventListener('storage', callback);
    return () => this.browser.removeEventListener('storage', callback);
  };
}
