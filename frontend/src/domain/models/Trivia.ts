import type { OrderedPageRecord, PageScope } from './Page';

export interface TriviaInput extends PageScope {
  readonly label: string;
  readonly value: string;
}
export interface Trivia extends TriviaInput, OrderedPageRecord {}
