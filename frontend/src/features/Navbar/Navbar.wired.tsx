import { useNavbarState, type NavbarWiring } from './useNavbarState';
import { Navbar } from './Navbar.presentational';
export function NavbarWired(props: NavbarWiring) {
  const state = useNavbarState(props);
  return <Navbar {...state} />;
}
