import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export type GeoPermission = 'granted' | 'prompt' | 'denied' | 'unknown';
export type GeoErrorKind = 'denied' | 'unavailable' | 'timeout' | 'unknown';

export interface StoredLocation {
  lat: string;
  lon: string;
  timestamp: number;
}

const STORAGE_KEY = 'qr-studio.lastLocation';

function readStored(): StoredLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' && parsed !== null &&
      'lat' in parsed && 'lon' in parsed && 'timestamp' in parsed &&
      typeof parsed.lat === 'string' && typeof parsed.lon === 'string' && typeof parsed.timestamp === 'number'
    ) {
      return { lat: parsed.lat, lon: parsed.lon, timestamp: parsed.timestamp };
    }
  } catch {
    /* JSON corrupto o localStorage bloqueado */
  }
  return null;
}

/**
 * Detección de ubicación con consulta previa de permisos (granted / prompt / denied),
 * manejo de los tres códigos de error y persistencia de la última ubicación.
 */
export function useGeolocation(onPosition: (lat: string, lon: string) => void) {
  const { t } = useTranslation();
  const supported =
    typeof navigator !== 'undefined' && 'geolocation' in navigator && window.isSecureContext;
  const unsupportedReason = supported
    ? null
    : window.isSecureContext
      ? t('geo.unsupported')
      : t('geo.unsupportedInsecure');

  const [permission, setPermission] = useState<GeoPermission>('unknown');
  const [loading, setLoading] = useState(false);
  const [errorKind, setErrorKind] = useState<GeoErrorKind | null>(null);
  const [last, setLast] = useState<StoredLocation | null>(readStored);

  // Estado del permiso (y cambios en vivo, p. ej. si el usuario lo concede en los ajustes).
  useEffect(() => {
    if (!supported || !navigator.permissions) return;
    let status: PermissionStatus | null = null;
    let cancelled = false;
    const sync = () => status && setPermission(status.state);
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((s) => {
        if (cancelled) return;
        status = s;
        sync();
        s.addEventListener('change', sync);
      })
      .catch(() => setPermission('unknown'));
    return () => {
      cancelled = true;
      status?.removeEventListener('change', sync);
    };
  }, [supported]);

  const fail = useCallback(
    (kind: GeoErrorKind) => {
      setErrorKind(kind);
      setLoading(false);
      const messages: Record<GeoErrorKind, string> = {
        denied: t('geo.toast.denied'),
        unavailable: t('geo.toast.unavailable'),
        timeout: t('geo.toast.timeout'),
        unknown: t('geo.toast.unknown'),
      };
      toast.error(messages[kind], kind === 'denied' ? { description: t('geo.deniedHelp') } : undefined);
    },
    [t],
  );

  const detect = useCallback(async () => {
    if (!supported) return;
    setLoading(true);
    setErrorKind(null);

    if (navigator.permissions) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        setPermission(status.state);
        if (status.state === 'denied') {
          fail('denied');
          return;
        }
      } catch {
        /* Permissions API incompleta: se intenta igualmente */
      }
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lon = pos.coords.longitude.toFixed(6);
        const stored: StoredLocation = { lat, lon, timestamp: Date.now() };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        } catch {
          /* ignorar */
        }
        setLast(stored);
        setPermission('granted');
        setLoading(false);
        onPosition(lat, lon);
        toast.success(t('geo.toast.detected'));
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setPermission('denied');
        fail(
          err.code === err.PERMISSION_DENIED
            ? 'denied'
            : err.code === err.POSITION_UNAVAILABLE
              ? 'unavailable'
              : err.code === err.TIMEOUT
                ? 'timeout'
                : 'unknown',
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, [supported, fail, onPosition, t]);

  const applyLast = useCallback(() => {
    if (!last) return;
    onPosition(last.lat, last.lon);
    toast.success(t('geo.toast.lastApplied'));
  }, [last, onPosition, t]);

  return { supported, unsupportedReason, permission, loading, errorKind, last, detect, applyLast };
}
