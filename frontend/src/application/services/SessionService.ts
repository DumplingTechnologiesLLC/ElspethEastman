import { getRequestAlert } from '../alerts/getRequestAlert';
import type { Clock } from '../../domain/ports/Clock';
import type { Http } from '../../domain/ports/Http';
import type { Navigation } from '../../domain/ports/Navigation';
import type { UIAlerts } from '../../domain/ports/UIAlerts';
import type { Session } from '../../domain/ports/Session';
import type { SessionState } from '../../domain/models/SessionState';
import type { TokenStorage } from '../../domain/ports/TokenStorage';
import { Store } from './Store';
import { cmsReturnTo, loginReturnTo } from '../routing/cmsReturnTo';

export class SessionService extends Store<SessionState> implements Session {
  private validation = 0;
  constructor(
    private http: Http,
    private tokens: TokenStorage,
    private navigation: Navigation,
    private notifications: UIAlerts,
    private clock: Clock,
  ) {
    super({
      path: navigation.location(),
      authenticated: Boolean(tokens.read()),
      username: '',
      password: '',
      submitting: false,
      errors: {},
    });
  }
  getPage = () => {
    const { path, authenticated } = this.getSnapshot();
    return path.startsWith('/cms')
      ? authenticated
        ? 'cms'
        : 'login'
      : path.startsWith('/login')
        ? 'login'
        : path.startsWith('/projects')
          ? 'projects'
          : 'home';
  };
  start = () => {
    const stopNavigation = this.navigation.listen(() => {
      const path = this.navigation.location();
      const changed =
        path.split(/[?#]/)[0] !== this.getSnapshot().path.split(/[?#]/)[0];
      this.patch({ path });
      if (changed) void this.validate();
    });
    const stopStorage = this.tokens.listen(() => {
      void this.validate();
    });
    void this.validate();
    return () => {
      this.validation++;
      stopNavigation();
      stopStorage();
    };
  };
  private async validate() {
    const validation = ++this.validation;
    const reply = await this.http.request<{ isAuthenticated: boolean }>(
      '/api/session/',
      'POST',
      undefined,
      true,
    );
    if (validation !== this.validation) return;
    const valid = reply.status === 200 && reply.data?.isAuthenticated === true;
    const wasAuthenticated = this.getSnapshot().authenticated;
    this.patch({ authenticated: valid });
    if (wasAuthenticated && !valid) {
      this.notifications.show({
        title: 'Session has expired',
        content: 'Please re-log in.',
        flavor: 'error',
      });
      this.tokens.write(null);
      this.navigate('/login');
    } else if (!valid && this.getSnapshot().path.startsWith('/cms'))
      this.navigate('/login');
  }
  navigate = (path: string) => this.navigation.go(path);
  replace = (path: string) => this.navigation.replace(path);
  expire = (returnTo: string) => {
    const state = this.getSnapshot();
    if (!state.authenticated && state.path.startsWith('/login')) return;
    this.validation++;
    this.tokens.write(null);
    this.patch({ authenticated: false });
    this.notifications.show({
      title: 'Session has expired',
      content: 'Please re-log in.',
      flavor: 'error',
    });
    this.replace(
      `/login?returnTo=${encodeURIComponent(cmsReturnTo(returnTo))}`,
    );
  };
  change = (key: 'username' | 'password', value: string) =>
    this.patch({
      [key]: value,
      errors: { ...this.getSnapshot().errors, [key]: '' },
    });
  login = async () => {
    if (this.getSnapshot().submitting) return;
    const { username, password } = this.getSnapshot();
    if (!username || !password) {
      const key = !username ? 'username' : 'password';
      this.patch({
        errors: {
          ...this.getSnapshot().errors,
          [key]: !username ? 'Username is required' : 'Password is required',
          form: '',
        },
      });
      this.notifications.show({
        title: 'Bad login',
        content: 'Please review your login information',
        flavor: 'error',
      });
      return;
    }
    this.patch({ submitting: true });
    const reply = await this.http.request<{ token?: string; detail?: string }>(
      '/api/session/login/',
      'POST',
      { username, password },
      true,
    );
    this.patch({ submitting: false, errors: {} });
    const alert = getRequestAlert(reply.status);
    if (alert) {
      this.notifications.show(alert);
      return;
    }
    if (reply.status === 200 && reply.data?.token) {
      const token = reply.data.token;
      this.notifications.show({
        title: 'Good login',
        content: 'Now logging you in',
        flavor: 'success',
      });
      this.clock.later(() => {
        this.tokens.write(token);
        this.patch({ authenticated: true });
        this.navigate(loginReturnTo(this.getSnapshot().path));
        void this.validate();
      }, 1000);
    } else if (reply.status === 400) {
      this.notifications.show({
        title: 'Bad login',
        content: 'Please review your login information',
        flavor: 'error',
      });
      this.patch({
        errors: {
          ...this.getSnapshot().errors,
          form: reply.data?.detail ?? '',
        },
      });
    }
  };
  logout = async () => {
    const reply = await this.http.request(
      '/api/session/logout/',
      'POST',
      undefined,
      true,
      'status',
    );
    if (reply.status === null) this.notifications.show(getRequestAlert(null)!);
    // Preserve the legacy browser logout when the request fails in transport.
    if (reply.status === 200 || reply.status === null) {
      this.notifications.show({
        title: 'Goodbye!',
        content: 'Successfully logged off',
        flavor: 'success',
      });
      this.tokens.write(null);
      this.patch({ authenticated: false });
      this.navigate('/login');
    } else
      this.notifications.show({
        title: 'Error',
        content: "We couldn't log you off properly. Please try again later",
        flavor: 'error',
      });
  };
}
