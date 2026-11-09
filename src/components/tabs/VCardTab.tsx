import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { useSliceForm } from '@/hooks/useSliceForm';
import { vcardSchema } from '@/lib/schemas';
import type { ContentMap } from '@/lib/types';
import { ClearButton, Field } from './Field';

type VCardKey = keyof ContentMap['vcard'];

interface FieldSpec {
  key: VCardKey;
  type?: string;
  autoComplete: string;
  wide?: boolean;
}

const FIELDS: FieldSpec[] = [
  { key: 'first', autoComplete: 'given-name' },
  { key: 'last', autoComplete: 'family-name' },
  { key: 'org', autoComplete: 'organization' },
  { key: 'jobtitle', autoComplete: 'organization-title' },
  { key: 'phone', type: 'tel', autoComplete: 'tel' },
  { key: 'email', type: 'email', autoComplete: 'email' },
  { key: 'website', type: 'url', autoComplete: 'url', wide: true },
  { key: 'street', autoComplete: 'street-address', wide: true },
  { key: 'city', autoComplete: 'address-level2' },
  { key: 'zip', autoComplete: 'postal-code' },
  { key: 'country', autoComplete: 'country-name', wide: true },
];

export function VCardTab() {
  const { t } = useTranslation();
  const { form, clear } = useSliceForm('vcard', vcardSchema);
  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map(({ key, type, autoComplete, wide }) => {
          const id = `vcard-${key}`;
          const error = form.formState.errors[key]?.message;
          return (
            <Field key={key} id={id} label={t(`fields.${key}`)} error={error} className={wide ? 'sm:col-span-2' : undefined}>
              <Input
                id={id}
                type={type}
                autoComplete={autoComplete}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                {...form.register(key)}
              />
            </Field>
          );
        })}
      </div>
      <ClearButton onClear={clear} />
    </div>
  );
}
