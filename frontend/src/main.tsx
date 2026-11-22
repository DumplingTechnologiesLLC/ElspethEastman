import { createRoot } from 'react-dom/client';
import { PortfolioWired } from './features/Portfolio/Portfolio.wired';
import { browserServices } from './platform/browserServices';
// oxlint-disable-next-line import/no-unassigned-import -- Loads global fonts and resets before rendering.
import './global.css';
export function mount(element: HTMLElement, browser: Window) {
  const services = browserServices(browser);
  const root = createRoot(element);
  root.render(<PortfolioWired services={services} />);
  return () => {
    root.unmount();
    services.dispose();
  };
}
mount(document.getElementById('root')!, window);
