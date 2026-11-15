import { vi } from 'vitest';
export const observers: TestIntersectionObserver[] = [];
export const frames: FrameRequestCallback[] = [];
export class TestIntersectionObserver {
  thresholds = [1];
  observe = vi.fn();
  unobserve = vi.fn();
  constructor(private callback: IntersectionObserverCallback) {
    observers.push(this);
  }
  trigger(ratio: number) {
    this.callback(
      [{ intersectionRatio: ratio }] as IntersectionObserverEntry[],
      this as unknown as IntersectionObserver,
    );
  }
}
export const canvasContext = {
  canvas: { width: 200, height: 200 },
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  stroke: vi.fn(),
  strokeStyle: '',
  lineWidth: 0,
};
export function installDom() {
  // jsdom supplies the element but not native dialog methods; browser tests cover the top layer and focus trap.
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      value: vi.fn(function (this: HTMLDialogElement) {
        this.open = true;
      }),
    },
    close: {
      configurable: true,
      value: vi.fn(function (this: HTMLDialogElement) {
        this.open = false;
      }),
    },
  });
  observers.length = 0;
  frames.length = 0;
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    canvasContext as unknown as CanvasRenderingContext2D,
  );
  vi.stubGlobal('IntersectionObserver', TestIntersectionObserver);
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    }),
  );
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
}
