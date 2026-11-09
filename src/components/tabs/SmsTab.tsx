import { useTranslation } from 'react-i18next';
import { Input, Textarea } from '@/components/ui/input';
import { useSliceForm } from '@/hooks/useSliceForm';
import { smsSchema } from '@/lib/schemas';
import { ClearButton, Field } from './Field';

export function SmsTab() {
  const { t } = useTranslation();
  const { form, clear } = useSliceForm('sms', smsSchema);
  return (
    <div className="space-y-4">
      <Field id="sms-number" label={t('fields.number')}>
        <Input id="sms-number" type="tel" autoComplete="off" inputMode="tel" {...form.register('number')} />
      </Field>
      <Field id="sms-message" label={t('fields.message')}>
        <Textarea id="sms-message" rows={6} {...form.register('message')} />
      </Field>
      <ClearButton onClear={clear} />
    </div>
  );
}
