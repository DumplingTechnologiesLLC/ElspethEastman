import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Hero } from '../Hero.presentational';
it('scrolls to the projects anchor and delegates contact actions', () => {
  const scroll = vi.fn();
  render(
    <>
      <div id="latestProjects" />
      <Hero onContact={vi.fn()} />
    </>,
  );
  document.querySelector('#latestProjects')!.scrollIntoView = scroll;
  const work = screen.getByRole('button', { name: 'See my work' });
  fireEvent.keyUp(work, { key: 'Escape' });
  fireEvent.keyUp(work, { key: 'Enter' });
  fireEvent.click(work);
  expect(scroll).toHaveBeenCalledTimes(2);
});
it('opens contact using either pointer or keyboard', () => {
  const contact = vi.fn();
  render(<Hero onContact={contact} />);
  const button = screen.getByRole('button', { name: 'Get in touch' });
  fireEvent.keyUp(button, { key: 'Escape' });
  fireEvent.keyUp(button, { key: 'Enter' });
  fireEvent.click(button);
  expect(contact).toHaveBeenCalledTimes(2);
});
