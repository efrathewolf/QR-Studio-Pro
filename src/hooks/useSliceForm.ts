import { useCallback, useEffect } from 'react';
import { useForm, type DefaultValues, type Resolver, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useQrStore } from '@/store/useQrStore';
import { EMPTY_CONTENT, type ContentMap, type TabId } from '@/lib/types';

/**
 * Formulario react-hook-form + zod sincronizado con una "rebanada" del store.
 * Cada cambio se vuelca al store (que alimenta el payload y la vista previa).
 */
export function useSliceForm<K extends TabId>(
  key: K,
  schema: z.ZodType<ContentMap[K]>,
): { form: UseFormReturn<ContentMap[K]>; clear: () => void } {
  const setContent = useQrStore((s) => s.setContent);
  const resetContent = useQrStore((s) => s.resetContent);

  const form = useForm<ContentMap[K]>({
    defaultValues: useQrStore.getState().content[key] as DefaultValues<ContentMap[K]>,
    resolver: zodResolver(schema) as Resolver<ContentMap[K]>,
    mode: 'onChange',
  });

  useEffect(() => {
    const sub = form.watch((values) => setContent(key, values as ContentMap[K]));
    return () => sub.unsubscribe();
  }, [form, key, setContent]);

  /** Vacía el formulario y el store (equivale al botón "Limpiar" original). */
  const clear = useCallback(() => {
    form.reset(EMPTY_CONTENT[key] as DefaultValues<ContentMap[K]>);
    resetContent(key);
  }, [form, key, resetContent]);

  return { form, clear };
}
