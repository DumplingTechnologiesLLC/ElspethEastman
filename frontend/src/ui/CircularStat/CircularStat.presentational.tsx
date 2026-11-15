import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef, useState } from 'react';
const css = stylex.create({
  container: { position: 'relative', textAlign: 'center' },
  label: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: 200,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  content: {
    fontSize: '1em',
    fontFamily: 'Montserrat, sans-serif',
    color: 'white',
    margin: '.25em 0',
  },
  bottom: { margin: 0 },
});
export interface CircularStatProps {
  value: string;
  label: string;
  percent: number;
}
export function CircularStat({ value, label, percent }: CircularStatProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const target = ref.current!;
    const observer = new IntersectionObserver(
      (entries, activeObserver) => {
        for (const entry of entries)
          setVisible(entry.intersectionRatio >= activeObserver.thresholds[0]!);
      },
      { root: null, threshold: 1 },
    );
    observer.observe(target);
    return () => observer.unobserve(target);
  }, []);
  useEffect(() => {
    const context = ref.current!.getContext('2d');
    if (!context) return;
    let frame = 0;
    let id = 0;
    const render = () => {
      frame++;
      context.clearRect(0, 0, 200, 200);
      context.strokeStyle = 'rgba(255, 255, 255, 0.521)';
      context.lineWidth = 14;
      context.beginPath();
      context.arc(100, 100, 87.5, 0, 2 * Math.PI);
      context.stroke();
      if (visible) {
        context.strokeStyle = 'white';
        context.beginPath();
        context.arc(
          100,
          100,
          87.5,
          Math.PI * 1.5,
          Math.PI * 1.5 + (((Math.PI * 2 * percent) / 100) * frame) / 100,
        );
        context.stroke();
      }
      if (frame === 100) cancelAnimationFrame(id);
      else id = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(id);
  }, [visible, percent]);
  return (
    <div {...stylex.props(css.container)}>
      <div {...stylex.props(css.label)}>
        <p {...stylex.props(css.content)}>{value}</p>
      </div>
      <canvas ref={ref} width={200} height={200} />
      <p {...stylex.props(css.content, css.bottom)}>{label}</p>
    </div>
  );
}
