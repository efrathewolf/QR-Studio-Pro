import { useCallback } from 'react';
import { ExternalLink, History, Loader2, LocateFixed, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useSliceForm } from '@/hooks/useSliceForm';
import { parseCoord, validLat, validLon } from '@/lib/payload';
import { geoSchema } from '@/lib/schemas';
import { useQrStore } from '@/store/useQrStore';
import { ClearButton, Field } from './Field';

export function LocationTab() {
  const { t } = useTranslation();
  const { form, clear } = useSliceForm('geo', geoSchema);
  const setContent = useQrStore((s) => s.setContent);
  const geo = useQrStore((s) => s.content.geo);

  const applyPosition = useCallback(
    (lat: string, lon: string) => {
      form.setValue('lat', lat, { shouldDirty: true, shouldValidate: true });
      form.setValue('lon', lon, { shouldDirty: true, shouldValidate: true });
      setContent('geo', { lat, lon });
    },
    [form, setContent],
  );

  const { supported, unsupportedReason, permission, loading, errorKind, last, detect, applyLast } =
    useGeolocation(applyPosition);

  const coordsValid = validLat(geo.lat) && validLon(geo.lon);
  const denied = permission === 'denied' || errorKind === 'denied';

  const openMaps = () => {
    const url = `https://www.google.com/maps?q=${parseCoord(geo.lat)},${parseCoord(geo.lon)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const latError = form.formState.errors.lat?.message;
  const lonError = form.formState.errors.lon?.message;

  const detectButton = (
    <Button onClick={() => void detect()} disabled={!supported || loading} aria-busy={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <LocateFixed className="h-4 w-4" aria-hidden />
      )}
      {loading ? t('geo.detecting') : t('geo.detect')}
    </Button>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {supported ? (
          detectButton
        ) : (
          <Tooltip>
            {/* Un botón deshabilitado no recibe foco/hover: el tooltip va en un contenedor enfocable. */}
            <TooltipTrigger asChild>
              <span tabIndex={0} className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {detectButton}
              </span>
            </TooltipTrigger>
            <TooltipContent>{unsupportedReason}</TooltipContent>
          </Tooltip>
        )}

        <Button variant="outline" onClick={openMaps} disabled={!coordsValid}>
          <ExternalLink className="h-4 w-4" aria-hidden />
          {t('geo.openMaps')}
        </Button>

        {last && (
          <Button variant="outline" onClick={applyLast}>
            <History className="h-4 w-4" aria-hidden />
            {t('geo.useLast')}
          </Button>
        )}
      </div>

      {!supported && unsupportedReason && (
        <p className="text-sm text-muted-foreground">{unsupportedReason}</p>
      )}

      {denied && (
        <div role="alert" className="flex gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
          <div>
            <p className="font-medium">{t('geo.deniedTitle')}</p>
            <p className="text-muted-foreground">{t('geo.deniedHelp')}</p>
          </div>
        </div>
      )}

      {supported && permission !== 'unknown' && (
        <p className="text-xs text-muted-foreground">
          {t('geo.permission.label')}: {t(`geo.permission.${permission}`)}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="geo-lat" label={t('fields.lat')} error={latError}>
          <Input
            id="geo-lat"
            inputMode="decimal"
            autoComplete="off"
            aria-invalid={latError ? true : undefined}
            aria-describedby={latError ? 'geo-lat-error' : undefined}
            {...form.register('lat')}
          />
        </Field>
        <Field id="geo-lon" label={t('fields.lon')} error={lonError}>
          <Input
            id="geo-lon"
            inputMode="decimal"
            autoComplete="off"
            aria-invalid={lonError ? true : undefined}
            aria-describedby={lonError ? 'geo-lon-error' : undefined}
            {...form.register('lon')}
          />
        </Field>
      </div>
      <ClearButton onClear={clear} />
    </div>
  );
}
