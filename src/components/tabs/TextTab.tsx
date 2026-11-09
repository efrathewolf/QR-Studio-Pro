import { useTranslation } from 'react-i18next';
import { Textarea } from '@/components/ui/input';
import { useSliceForm } from '@/hooks/useSliceForm';
import { textSchema } from '@/lib/schemas';
import { ClearButton, Field } from './Field';

export function TextTab() {
  const { t } = useTranslation();
  const { form, clear } = useSliceForm('text', textSchema);
  return (
    <div className="space-y-3">
      <Field id="text-content" label={t('fields.content')}>
        <Textarea
          id="text-content"
          rows={8}
          placeholder={t('placeholders.content')}
          spellCheck={false}
          {...form.register('text')}
        />
      </Field>
      <ClearButton onClear={clear} />
    </div>
  );
}
