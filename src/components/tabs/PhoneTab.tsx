import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { useSliceForm } from '@/hooks/useSliceForm';
import { phoneSchema } from '@/lib/schemas';
import { ClearButton, Field } from './Field';

export function PhoneTab() {
  const { t } = useTranslation();
  const { form, clear } = useSliceForm('phone', phoneSchema);
  return (
    <div className="space-y-4">
      <Field id="phone-number" label={t('fields.number')}>
        <Input id="phone-number" type="tel" autoComplete="off" inputMode="tel" {...form.register('number')} />
      </Field>
      <ClearButton onClear={clear} />
    </div>
  );
}
