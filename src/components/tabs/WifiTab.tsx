import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSliceForm } from '@/hooks/useSliceForm';
import { wifiSchema } from '@/lib/schemas';
import type { WifiEncryption } from '@/lib/types';
import { ClearButton, Field } from './Field';

const ENCRYPTIONS: WifiEncryption[] = ['nopass', 'WPA', 'WEP'];

export function WifiTab() {
  const { t } = useTranslation();
  const { form, clear } = useSliceForm('wifi', wifiSchema);
  const [showPassword, setShowPassword] = useState(false);
  const encryption = form.watch('encryption');

  return (
    <div className="space-y-4">
      <Field id="wifi-ssid" label={t('fields.ssid')}>
        <Input id="wifi-ssid" autoComplete="off" spellCheck={false} {...form.register('ssid')} />
      </Field>

      <Field id="wifi-password" label={t('fields.password')}>
        <div className="relative">
          <Input
            id="wifi-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="off"
            disabled={encryption === 'nopass'}
            className="pr-11"
            {...form.register('password')}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-10 w-10"
            aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          </Button>
        </div>
      </Field>

      <Field id="wifi-encryption" label={t('fields.encryption')}>
        <Controller
          control={form.control}
          name="encryption"
          render={({ field }) => (
            <Select value={field.value} onValueChange={(v) => field.onChange(v as WifiEncryption)}>
              <SelectTrigger id="wifi-encryption">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENCRYPTIONS.map((e) => (
                  <SelectItem key={e} value={e}>
                    {t(`enc.${e}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <div className="flex items-center justify-between gap-4 rounded-md border border-border px-3 py-3">
        <Label htmlFor="wifi-hidden">{t('fields.hidden')}</Label>
        <Controller
          control={form.control}
          name="hidden"
          render={({ field }) => (
            <Switch id="wifi-hidden" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </div>
      <ClearButton onClear={clear} />
    </div>
  );
}
