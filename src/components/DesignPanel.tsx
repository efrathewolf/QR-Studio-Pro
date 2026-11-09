import { useRef } from 'react';
import { ImagePlus, RotateCcw, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COLOR_MODES, EC_LEVELS, SHAPES, type ColorMode, type EcLevel, type LogoData, type ModuleShape } from '@/lib/types';
import { useQrStore } from '@/store/useQrStore';
import { ColorField } from './ColorField';
import { SliderField } from './SliderField';

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];

function readLogo(file: File): Promise<LogoData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const img = new Image();
      img.onerror = () => reject(new Error('decode failed'));
      img.onload = () =>
        // Los SVG sin tamaño intrínseco devuelven 0: se asume cuadrado.
        resolve({ dataUrl, name: file.name, width: img.naturalWidth || 100, height: img.naturalHeight || 100 });
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export function DesignPanel() {
  const { t } = useTranslation();
  const design = useQrStore((s) => s.design);
  const setDesign = useQrStore((s) => s.setDesign);
  const resetDesign = useQrStore((s) => s.resetDesign);
  const fileRef = useRef<HTMLInputElement>(null);

  /** Con logo, L y M suben a H y se avisa (igual que la app original). */
  const raiseEcIfNeeded = (ec: EcLevel, hasLogo: boolean): EcLevel => {
    if (hasLogo && (ec === 'L' || ec === 'M')) {
      toast.info(t('design.logoEcRaised'));
      return 'H';
    }
    return ec;
  };

  const onEcChange = (value: string) => {
    setDesign({ ec: raiseEcIfNeeded(value as EcLevel, design.logo !== null) });
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (!LOGO_TYPES.includes(file.type)) {
      toast.error(t('design.logoInvalid'));
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error(t('design.logoTooBig'));
      return;
    }
    try {
      const logo = await readLogo(file);
      setDesign({ logo, ec: raiseEcIfNeeded(design.ec, true) });
    } catch {
      toast.error(t('design.logoInvalid'));
    }
  };

  const removeLogo = () => {
    setDesign({ logo: null });
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <section aria-labelledby="design-title" className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="design-title" className="text-lg font-semibold">
          {t('design.title')}
        </h2>
        <Button variant="ghost" size="sm" onClick={resetDesign}>
          <RotateCcw className="h-4 w-4" aria-hidden />
          {t('design.reset')}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="design-shape">{t('design.shape')}</Label>
          <Select value={design.shape} onValueChange={(v) => setDesign({ shape: v as ModuleShape })}>
            <SelectTrigger id="design-shape">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SHAPES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`design.shapes.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="design-mode">{t('design.colorMode')}</Label>
          <Select value={design.colorMode} onValueChange={(v) => setDesign({ colorMode: v as ColorMode })}>
            <SelectTrigger id="design-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COLOR_MODES.map((m) => (
                <SelectItem key={m} value={m}>
                  {t(`design.modes.${m}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <ColorField id="design-fg" label={t('design.fg')} value={design.fg} onChange={(fg) => setDesign({ fg })} />
        <ColorField id="design-bg" label={t('design.bg')} value={design.bg} onChange={(bg) => setDesign({ bg })} />
        <ColorField
          id="design-grad"
          label={t('design.grad')}
          value={design.grad}
          onChange={(grad) => setDesign({ grad })}
          disabled={design.colorMode === 'solid'}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <SliderField label={t('design.box')} value={design.box} min={1} max={60} onChange={(box) => setDesign({ box })} suffix=" px" />
        <SliderField label={t('design.border')} value={design.border} min={0} max={30} onChange={(border) => setDesign({ border })} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="design-ec">{t('design.ec')}</Label>
        <Select value={design.ec} onValueChange={onEcChange}>
          <SelectTrigger id="design-ec">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EC_LEVELS.map((l) => (
              <SelectItem key={l} value={l}>
                {t(`design.ecLevels.${l}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 rounded-md border border-border p-3">
        <Label htmlFor="design-logo">{t('design.logo')}</Label>
        <input
          ref={fileRef}
          id="design-logo"
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          className="sr-only"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
        <div className="flex flex-wrap items-center gap-3">
          {design.logo ? (
            <img
              src={design.logo.dataUrl}
              alt={t('design.logoAlt')}
              className="h-12 w-12 rounded-md border border-border bg-white object-contain p-1"
            />
          ) : (
            <div className="grid h-12 w-12 place-items-center rounded-md border border-dashed border-input text-muted-foreground">
              <ImagePlus className="h-5 w-5" aria-hidden />
            </div>
          )}
          <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
            {design.logo ? design.logo.name : t('design.noLogo')}
          </p>
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            {t('design.browse')}
          </Button>
          <Button variant="ghost" size="sm" onClick={removeLogo} disabled={!design.logo}>
            <Trash2 className="h-4 w-4" aria-hidden />
            {t('design.remove')}
          </Button>
        </div>
        <SliderField
          label={t('design.logoSize')}
          value={design.logoSize}
          min={5}
          max={40}
          onChange={(logoSize) => setDesign({ logoSize })}
          disabled={!design.logo}
          suffix=" %"
        />
      </div>
    </section>
  );
}
