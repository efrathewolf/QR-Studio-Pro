import { Download, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

export function InstallBanner() {
  const { t } = useTranslation();
  const { canInstall, install, dismiss } = useInstallPrompt();
  if (!canInstall) return null;
  return (
    <div
      role="region"
      aria-label={t('install.action')}
      className="glass fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md items-center gap-3 rounded-lg p-3 animate-in fade-in-0 slide-in-from-bottom-4"
    >
      <p className="flex-1 text-sm">{t('install.text')}</p>
      <Button size="sm" onClick={() => void install()}>
        <Download className="h-4 w-4" aria-hidden />
        {t('install.action')}
      </Button>
      <Button size="icon" variant="ghost" className="h-9 w-9" onClick={dismiss} aria-label={t('install.dismiss')}>
        <X className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  );
}
