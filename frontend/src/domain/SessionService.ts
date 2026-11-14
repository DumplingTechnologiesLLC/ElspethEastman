import type {
  Clock,
  Http,
  Navigation,
  Notifications,
  Session,
  SessionState,
  TokenStorage,
} from './contracts';
import { Store } from './Store';
export class SessionService extends Store<SessionState> implements Session {
  constructor(
    private http: Http,
    private tokens: TokenStorage,
    private navigation: Navigation,
    private notifications: Notifications,
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
        path.split('#')[0] !== this.getSnapshot().path.split('#')[0];
      this.patch({ path });
      if (changed) void this.validate();
    });
    const stopStorage = this.tokens.listen(() => {
      void this.validate();
    });
    void this.validate();
    return () => {
      stopNavigation();
      stopStorage();
    };
  };
  private async validate() {
    const reply = await this.http.request<{ isAuthenticated: boolean }>(
      '/api/session/',
      'POST',
      undefined,
      true,
    );
    const valid = reply.status === 200 && reply.data.isAuthenticated;
    const wasAuthenticated = this.getSnapshot().authenticated;
    this.patch({ authenticated: valid });
    if (wasAuthenticated && !valid) {
      this.notifications.show(
        'Session has expired',
        'Please re-log in.',
        'error',
      );
      this.tokens.write(null);
      this.navigate('/login');
    } else if (!valid && this.getSnapshot().path.startsWith('/cms'))
      this.navigate('/login');
  }
  navigate = (path: string) => this.navigation.go(path);
  change = (key: 'username' | 'password', value: string) =>
    this.patch({
      [key]: value,
      errors: { ...this.getSnapshot().errors, [key]: '' },
    });
  login = async () => {
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
      this.notifications.show(
        'Bad login',
        'Please review your login information',
        'error',
      );
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
    if (reply.status === 200 && reply.data.token) {
      const token = reply.data.token;
      this.notifications.show('Good login', 'Now logging you in', 'success');
      this.clock.later(() => {
        this.tokens.write(token);
        this.patch({ authenticated: true });
        this.navigate('/cms');
        void this.validate();
      }, 1000);
    } else if (reply.status === 400) {
      this.notifications.show(
        'Bad login',
        'Please review your login information',
        'error',
      );
      this.patch({
        errors: { ...this.getSnapshot().errors, form: reply.data.detail ?? '' },
      });
    }
  };
  logout = async () => {
    const reply = await this.http.request(
      '/api/session/logout/',
      'POST',
      undefined,
      true,
    );
    if (reply.status === 200) {
      this.notifications.show('Goodbye!', 'Successfully logged off', 'success');
      this.tokens.write(null);
      this.patch({ authenticated: false });
      this.navigate('/login');
    } else
      this.notifications.show(
        'Error',
        "We couldn't log you off properly. Please try again later",
        'error',
      );
  };
}
