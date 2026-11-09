import { useMemo, useState } from 'react';
import { Download, Loader2, QrCode, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import { useQrPayload } from '@/hooks/useQrPayload';
import { buildFilename, rasterize, saveBlob } from '@/lib/download';
import { buildQrSvg, svgToDataUrl } from '@/lib/svg';
import type { ExportFormat } from '@/lib/types';
import { useQrStore } from '@/store/useQrStore';

const FORMATS: ExportFormat[] = ['png', 'jpg', 'svg'];

interface QRPanelProps {
  /** Abre el panel de diseño (solo en móvil). */
  onOpenDesign?: () => void;
}

export function QRPanel({ onOpenDesign }: QRPanelProps) {
  const { t } = useTranslation();
  const payload = useQrPayload();
  const design = useQrStore((s) => s.design);
  const activeTab = useQrStore((s) => s.activeTab);
  const [format, setFormat] = useState<ExportFormat>('png');
  const [saving, setSaving] = useState(false);

  // Vista previa en vivo con debounce de 200 ms.
  const live = useDebounce({ payload, design }, 200);

  const preview = useMemo(() => {
    if (!live.payload) return { kind: 'empty' as const };
    try {
      return { kind: 'ok' as const, url: svgToDataUrl(buildQrSvg(live.payload, live.design).svg) };
    } catch {
      return { kind: 'tooLong' as const };
    }
  }, [live]);

  const onSave = async () => {
    if (!payload) return;
    setSaving(true);
    try {
      // Se regenera con el estado más reciente (sin esperar al debounce).
      const { svg, size } = buildQrSvg(payload, design);
      const blob = format === 'svg' ? new Blob([svg], { type: 'image/svg+xml' }) : await rasterize(svg, size, format);
      const result = await saveBlob(blob, buildFilename(activeTab, format), format, t(`export.formats.${format}`));
      if (result === 'saved') toast.success(t('export.saved'));
    } catch {
      toast.error(t('export.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass rounded-lg p-4 lg:p-5">
      <h2 className="sr-only">{t('preview.title')}</h2>

      <div className="crop-marks mx-auto grid aspect-square w-full max-w-[200px] place-items-center lg:max-w-[320px]">
        {preview.kind === 'ok' ? (
          <img
            src={preview.url}
            alt={t('preview.alt')}
            className="h-full w-full rounded-sm object-contain [image-rendering:pixelated]"
            draggable={false}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 px-3 text-center text-sm text-muted-foreground" role="status">
            <QrCode className="h-8 w-8" aria-hidden />
            <p>{preview.kind === 'tooLong' ? t('preview.tooLong') : t('preview.empty')}</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-end gap-2">
        <div className="w-28 shrink-0">
          <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
            <SelectTrigger aria-label={t('export.format')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMATS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button className="flex-1" onClick={() => void onSave()} disabled={preview.kind !== 'ok' || saving} aria-busy={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
          {saving ? t('export.saving') : t('export.save')}
        </Button>
        {onOpenDesign && (
          <Button variant="outline" size="icon" onClick={onOpenDesign} aria-label={t('design.open')}>
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}
