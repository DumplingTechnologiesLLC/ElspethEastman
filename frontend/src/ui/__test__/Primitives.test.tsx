import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import {
  Paragraph,
  Title,
  Subtitle,
  SpottedSection,
  Button,
  Icon,
  Field,
} from '../Primitives.presentational';
it('renders typographic primitives, decorations and button variants', () => {
  render(
    <SpottedSection>
      <Title>
        Title <Subtitle>Subtitle</Subtitle>
      </Title>
      <Paragraph>Content</Paragraph>
      {(
        ['primary', 'secondary', 'warning', 'danger', 'background'] as const
      ).map((variant) => (
        <Button key={variant} variant={variant} disabled={variant === 'danger'}>
          {variant}
        </Button>
      ))}
      <Button>Default</Button>
      <Icon definition={faSpinner} />
      <Icon
        definition={{
          ...faSpinner,
          icon: [512, 512, [], 'code', ['M0 0', 'M1 1']],
        }}
        pulse
        size="2em"
      />
    </SpottedSection>,
  );
  expect(screen.getByRole('heading')).toHaveTextContent('Title Subtitle');
  expect(screen.getByRole('button', { name: 'danger' })).toBeDisabled();
});
it('focuses DOM inputs and forwards value and Enter actions', () => {
  const change = vi.fn();
  const enter = vi.fn();
  const view = render(
    <Field
      name="Name"
      label="Name"
      value=""
      onChange={change}
      autoFocus
      caps={<span>Cap</span>}
      onEnter={enter}
    />,
  );
  const input = screen.getByRole('textbox');
  expect(input).toHaveFocus();
  fireEvent.change(input, { target: { value: 'Visitor' } });
  fireEvent.keyDown(input, { key: 'Escape' });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(change).toHaveBeenCalledWith('Visitor');
  expect(enter).toHaveBeenCalledOnce();
  view.rerender(<Field name="Name" label="Name" value="" onChange={change} />);
  fireEvent.keyDown(input, { key: 'Enter' });
});
it.each([undefined, 'Invalid', ['One'], ['One', 'Two']])(
  'renders input and textarea errors %s',
  (error) => {
    const { unmount } = render(
      <Field
        name="Name"
        label="Name"
        value=""
        onChange={vi.fn()}
        error={error}
      />,
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    unmount();
    render(
      <Field
        name="Message"
        label="Message"
        value=""
        onChange={vi.fn()}
        multiline
        error={error}
      />,
    );
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA');
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Hello' },
    });
  },
);
