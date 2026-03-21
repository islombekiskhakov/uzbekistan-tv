import { useRef, useCallback, useState } from 'react';

export function useTilt3D(intensity = 12) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setStyle({
      rotateX: (0.5 - y) * intensity,
      rotateY: (x - 0.5) * intensity,
    });
  }, [intensity]);

  const handleMouseLeave = useCallback(() => {
    setStyle({ rotateX: 0, rotateY: 0 });
  }, []);

  return { ref, style, handleMouseMove, handleMouseLeave };
}
