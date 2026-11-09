import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'sonner';
import { ContentCard } from '@/components/ContentCard';
import { DesignPanel } from '@/components/DesignPanel';
import { Header } from '@/components/Header';
import { InstallBanner } from '@/components/InstallBanner';
import { QRPanel } from '@/components/QRPanel';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function App() {
  const { t } = useTranslation();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [designOpen, setDesignOpen] = useState(false);
  const dark = document.documentElement.classList.contains('dark');

  return (
    <TooltipProvider delayDuration={200}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2">
        {t('app.skip')}
      </a>
      <Header />

      <main id="main" className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
        {/* Móvil: la vista previa queda fija arriba. Escritorio: columna derecha pegajosa. */}
        <aside className="sticky top-0 z-30 -mx-4 bg-background/80 px-4 py-2 backdrop-blur-xl lg:col-start-2 lg:row-start-1 lg:mx-0 lg:self-start lg:bg-transparent lg:p-0 lg:top-6 lg:backdrop-blur-none">
          <QRPanel onOpenDesign={isDesktop ? undefined : () => setDesignOpen(true)} />
        </aside>

        <div className="space-y-6 lg:col-start-1 lg:row-start-1">
          <ContentCard />
          {isDesktop && (
            <Card>
              <DesignPanel />
            </Card>
          )}
        </div>
      </main>

      {!isDesktop && (
        <Sheet open={designOpen} onOpenChange={setDesignOpen}>
          <SheetContent>
            <SheetTitle className="sr-only">{t('design.title')}</SheetTitle>
            <SheetDescription className="sr-only">{t('design.title')}</SheetDescription>
            <DesignPanel />
          </SheetContent>
        </Sheet>
      )}

      <InstallBanner />
      <Toaster position="bottom-center" theme={dark ? 'dark' : 'light'} closeButton />
    </TooltipProvider>
  );
}
