import { useRef, useCallback } from 'react';

/**
 * Real cursor-tracked 3D tilt. Attach the returned handlers + ref to any
 * element that also has the `.tilt` class. It writes CSS custom properties
 * (--tilt-rx/ry for rotation, --tilt-mx/my for the moving specular glare)
 * so the transform stays on the GPU and never triggers React re-renders.
 *
 *   const tilt = useTilt({ max: 8 });
 *   <div className="tilt" {...tilt.bind}>...<span className="tilt-glare" /></div>
 */
export const useTilt = ({ max = 8 } = {}) => {
  const ref = useRef(null);
  const frame = useRef(0);

  const onMouseMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;   // 0..1
      const py = (e.clientY - rect.top) / rect.height;   // 0..1
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        el.style.setProperty('--tilt-ry', `${(px - 0.5) * 2 * max}deg`);
        el.style.setProperty('--tilt-rx', `${(0.5 - py) * 2 * max}deg`);
        el.style.setProperty('--tilt-mx', `${px * 100}%`);
        el.style.setProperty('--tilt-my', `${py * 100}%`);
      });
    },
    [max]
  );

  const onMouseEnter = useCallback(() => {
    ref.current?.classList.add('is-tilting');
  }, []);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.classList.remove('is-tilting');
    el.style.setProperty('--tilt-rx', '0deg');
    el.style.setProperty('--tilt-ry', '0deg');
  }, []);

  return { ref, bind: { onMouseMove, onMouseEnter, onMouseLeave } };
};
