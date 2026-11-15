export interface Link {
  readonly label: string;
  readonly href: string;
  readonly isExternal: boolean;
}

export interface LinkInput {
  readonly label: string;
  readonly url: string;
}
