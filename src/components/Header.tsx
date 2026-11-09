import { Globe, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LANGUAGES, type Language } from '@/i18n/i18n';
import { useTheme } from '@/hooks/useTheme';

export function Header() {
  const { t, i18n } = useTranslation();
  const { theme, toggle } = useTheme();
  const current = (LANGUAGES as readonly string[]).includes(i18n.resolvedLanguage ?? '')
    ? (i18n.resolvedLanguage as Language)
    : 'en';

  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 lg:py-6">
      <div className="flex items-center gap-3">
        <img src="/icon.svg" alt="" className="h-9 w-9 rounded-md" />
        <div className="leading-tight">
          <p className="text-lg font-bold tracking-tight">{t('app.title')}</p>
          <p className="hidden text-sm text-muted-foreground sm:block">{t('app.subtitle')}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Select value={current} onValueChange={(lng) => void i18n.changeLanguage(lng)}>
          <SelectTrigger aria-label={t('header.language')} className="w-auto min-w-32 bg-card/70">
            <Globe className="h-4 w-4 shrink-0" aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {LANGUAGES.map((lng) => (
              <SelectItem key={lng} value={lng}>
                {t(`language.${lng}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={toggle}
          aria-label={theme === 'dark' ? t('header.toLight') : t('header.toDark')}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
        </Button>
      </div>
    </header>
  );
}
