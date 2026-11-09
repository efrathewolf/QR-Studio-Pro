import { useEffect, useState } from 'react';

/** Devuelve `value` con retraso: solo se actualiza tras `delay` ms sin cambios. */
export function useDebounce<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
