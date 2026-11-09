import { HexColorInput, HexColorPicker } from 'react-colorful';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ColorFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
}

/** Muestra el color + campo hex; el selector visual se abre en un popover. */
export function ColorField({ id, label, value, onChange, disabled }: ColorFieldProps) {
  const { t } = useTranslation();
  const commit = (hex: string) => onChange(hex.toUpperCase());
  return (
    <div className={cn('space-y-1.5', disabled && 'opacity-50')}>
      <label htmlFor={id} className="text-sm font-medium leading-none">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger
            disabled={disabled}
            aria-label={`${t('design.chooseColor')}: ${label}`}
            className="h-10 w-10 shrink-0 rounded-md border border-input shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ backgroundColor: value }}
          />
          <PopoverContent className="w-auto">
            <HexColorPicker color={value} onChange={commit} />
          </PopoverContent>
        </Popover>
        <HexColorInput
          id={id}
          color={value}
          onChange={commit}
          prefixed
          disabled={disabled}
          className="h-10 w-full min-w-0 rounded-md border border-input bg-card/60 px-3 font-mono text-sm uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}
