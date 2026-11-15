import { it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Application } from '../Application.presentational';
const slots = {
  navbar: <span>Nav slot</span>,
  skills: <span>Skills slot</span>,
  projects: <span>Projects slot</span>,
  experience: <span>Experience slot</span>,
  footer: <span>Footer slot</span>,
  contact: <span>Contact slot</span>,
  login: <span>Login slot</span>,
  notifications: <span>Notification slot</span>,
};
it.each(['home', 'projects', 'cms', 'login'])(
  'composes the %s page solely from presentation slots',
  (page) => {
    render(<Application {...slots} page={page} onContact={vi.fn()} />);
    expect(screen.getByText('Nav slot')).toBeInTheDocument();
    expect(screen.getByText('Notification slot')).toBeInTheDocument();
    if (page === 'home' || page === 'cms')
      expect(screen.getByText('Skills slot')).toBeInTheDocument();
    if (page === 'login')
      expect(screen.getByText('Login slot')).toBeInTheDocument();
  },
);
