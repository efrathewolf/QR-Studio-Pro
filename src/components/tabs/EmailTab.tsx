import { useTranslation } from 'react-i18next';
import { Input, Textarea } from '@/components/ui/input';
import { useSliceForm } from '@/hooks/useSliceForm';
import { emailSchema } from '@/lib/schemas';
import { ClearButton, Field } from './Field';

export function EmailTab() {
  const { t } = useTranslation();
  const { form, clear } = useSliceForm('email', emailSchema);
  const toError = form.formState.errors.to?.message;
  return (
    <div className="space-y-4">
      <Field id="email-to" label={t('fields.to')} error={toError}>
        <Input
          id="email-to"
          type="email"
          autoComplete="off"
          aria-invalid={toError ? true : undefined}
          aria-describedby={toError ? 'email-to-error' : undefined}
          {...form.register('to')}
        />
      </Field>
      <Field id="email-subject" label={t('fields.subject')}>
        <Input id="email-subject" {...form.register('subject')} />
      </Field>
      <Field id="email-body" label={t('fields.body')}>
        <Textarea id="email-body" rows={6} {...form.register('body')} />
      </Field>
      <ClearButton onClear={clear} />
    </div>
  );
}
