import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageIntro } from './PageIntro.presentational';
import { CopyKind } from '../../domain/models/PageCopy';
import { InteriorLayout } from '../InteriorLayout/InteriorLayout.presentational';
import { withSurface } from '../../stories/withSurface';
import { editableView } from '../Editable/Editable.stories';
const noop = () => {};
export const voiceIntroView = {
  fallbackHeading: null,
  blocks: [
    {
      key: 'heading',
      kind: CopyKind.Headline,
      text: 'Voiceover',
      actions: null,
    },
    {
      key: 'sub',
      kind: CopyKind.Subheadline,
      text: "Character-forward performance with range, specificity, and enough personality to survive contact with a writers' room.",
      actions: null,
    },
    {
      key: 'body',
      kind: CopyKind.Body,
      text: 'Elspeth has worked in games and animation since 2012, with roles spanning major live-service titles, indie leads, recurring franchise characters, and English-language animation.',
      actions: null,
    },
  ],
  identities: [
    { id: 1, label: 'Character', actions: null },
    { id: 2, label: 'Games', actions: null },
    { id: 3, label: 'Animation', actions: null },
  ],
  trivia: [
    {
      id: 1,
      label: 'Selected work',
      value: 'Games · Animation',
      actions: null,
    },
    { id: 2, label: 'Active since', value: '2012', actions: null },
    {
      id: 3,
      label: 'Availability',
      value: 'Contact for casting',
      actions: null,
    },
  ],
  action: {
    label: 'Play voiceover reel',
    href: 'https://example.invalid/reel',
    isExternal: true,
    icon: 'play',
  },
  controls: null,
} satisfies Parameters<typeof PageIntro>[0];
export function IntroPreview(props: Parameters<typeof PageIntro>[0]) {
  return (
    <InteriorLayout intro={<PageIntro {...props} />}>
      Page content
    </InteriorLayout>
  );
}
const meta = {
  component: PageIntro,
  args: voiceIntroView,
  render: IntroPreview,
  excludeStories: /.*View$|.*Preview$/,
  decorators: [withSurface],
  tags: ['autodocs'],
} satisfies Meta<typeof PageIntro>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
export const CMS: StoryObj<typeof meta> = {
  args: {
    blocks: voiceIntroView.blocks.map((block) => ({
      ...block,
      actions: editableView,
    })),
    controls: {
      disabled: false,
      settings: noop,
      addText: noop,
      addIdentity: noop,
      addFact: noop,
    },
  },
};
