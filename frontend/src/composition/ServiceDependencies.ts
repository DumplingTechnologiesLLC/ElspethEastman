import type { Clock } from '../domain/ports/Clock';
import type { Http } from '../domain/ports/Http';
import type { Navigation } from '../domain/ports/Navigation';
import type { TokenStorage } from '../domain/ports/TokenStorage';
export interface ServiceDependencies {
  http: Http;
  tokens: TokenStorage;
  navigation: Navigation;
  clock: Clock;
}
