export interface UIAlert {
  title: string;
  content: string;
  flavor: 'error' | 'success' | 'warning' | 'info';
}
