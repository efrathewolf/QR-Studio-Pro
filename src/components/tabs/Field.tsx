import type { ReactNode } from 'react';
import { Eraser } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FieldProps {
  id: string;
  label: string;
  /** Clave i18n del mensaje de error (viene de zod). */
  error?: string;
  className?: string;
  children: ReactNode;
}

/** Etiqueta + control + mensaje de error asociado (aria-describedby lo conecta el control). */
export function Field({ id, label, error, className, children }: FieldProps) {
  const { t } = useTranslation();
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {t(error)}
        </p>
      )}
    </div>
  );
}

export function ClearButton({ onClear }: { onClear: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex justify-end pt-1">
      <Button variant="ghost" size="sm" onClick={onClear}>
        <Eraser className="h-4 w-4" aria-hidden />
        {t('common.clear')}
      </Button>
    </div>
  );
}
