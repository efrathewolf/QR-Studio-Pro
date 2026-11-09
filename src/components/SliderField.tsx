import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  suffix?: string;
}

export function SliderField({ label, value, min, max, onChange, disabled, suffix = '' }: SliderFieldProps) {
  return (
    <div className={cn('space-y-2', disabled && 'opacity-50')}>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground" aria-hidden>
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        thumbLabel={label}
        min={min}
        max={max}
        step={1}
        value={[value]}
        disabled={disabled}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  );
}
