import {
  useNotificationsState,
  type NotificationsWiring,
} from './useNotificationsState';
import { Notifications } from './Notifications.presentational';
export function NotificationsWired(props: NotificationsWiring) {
  const state = useNotificationsState(props);
  return <Notifications {...state} />;
}
