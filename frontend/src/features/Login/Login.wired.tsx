import { useLoginState, type LoginWiring } from './useLoginState';
import { Login } from './Login.presentational';
export function LoginWired(props: LoginWiring) {
  const state = useLoginState(props);
  return <Login {...state} />;
}
