import { useMemo } from 'react';
import { buildPayload } from '@/lib/payload';
import { useQrStore } from '@/store/useQrStore';

/** Payload del QR para la pestaña activa (null si faltan datos obligatorios). */
export function useQrPayload(): string | null {
  const activeTab = useQrStore((s) => s.activeTab);
  const content = useQrStore((s) => s.content);
  return useMemo(() => buildPayload(activeTab, content), [activeTab, content]);
}
