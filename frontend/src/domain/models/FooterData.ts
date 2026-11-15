import type { Affiliation } from './Affiliation';

import type { FooterStat } from './FooterStat';

export interface FooterData {
  stats: FooterStat[];
  affiliations: Affiliation[];
}
