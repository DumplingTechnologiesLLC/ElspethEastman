export type Unsubscribe = () => void;
export interface Readable<T> {
  getSnapshot: () => T;
  subscribe: (listener: () => void) => Unsubscribe;
}
export interface Clock {
  now: () => number;
  later: (callback: () => void, milliseconds: number) => Unsubscribe;
}
export interface Navigation {
  location: () => string;
  go: (path: string) => void;
  listen: (callback: () => void) => Unsubscribe;
}
export interface TokenStorage {
  read: () => string | null;
  write: (token: string | null) => void;
  listen: (callback: () => void) => Unsubscribe;
}
export type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';
export interface Reply<T> {
  status: number | null;
  data: T;
}
export interface Http {
  request: <T>(
    path: string,
    method?: Method,
    body?: unknown,
    authenticated?: boolean,
    responseType?: 'json' | 'status',
  ) => Promise<Reply<T>>;
}
export interface Toast {
  id: number;
  title: string;
  content: string;
  flavor: 'error' | 'success' | 'warning' | 'info';
}
export interface Notifications extends Readable<readonly Toast[]> {
  show: (title: string, content: string, flavor: Toast['flavor']) => void;
  dismiss: (id: number) => void;
  dispose: () => void;
}
export interface SessionState {
  path: string;
  authenticated: boolean;
  username: string;
  password: string;
  submitting: boolean;
  errors: Errors;
}
export type ApplicationPage = 'home' | 'projects' | 'cms' | 'login';
export interface Session extends Readable<SessionState> {
  getPage: () => ApplicationPage;
  start: () => Unsubscribe;
  change: (key: 'username' | 'password', value: string) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  navigate: (path: string) => void;
}
export type Errors = Record<string, string | string[]>;
export interface Project {
  id: number;
  src: string;
  title: string;
  uuid: number | null;
}
export interface Experience {
  id: number;
  year: string;
  link: string | null;
  tba: boolean;
  credit: string;
}
export const categories = [
  'Voice Credits',
  'Music - Games',
  'Music - Miscellaneous',
  'Streaming - Credits',
] as const;
export type Category = (typeof categories)[number];
export interface ExperienceDraft {
  year: string;
  link: string;
  credit: string;
  tba: boolean;
  category: Category;
}
export interface Affiliation {
  id: number;
  affiliation: string;
  link: string | null;
}
export interface FooterStat {
  id: number;
  value: string;
  label: string;
  percent: number;
}
export interface FooterData {
  stats: FooterStat[];
  affiliations: Affiliation[];
}
export type SkillKey = 'voice_acting' | 'game_development' | 'streaming';
export type Skills = Record<SkillKey, string>;
export interface SkillsData {
  data: Skills;
  lookup: Record<string, string>;
}
export interface ContactDraft {
  name: string;
  email: string;
  message: string;
}
