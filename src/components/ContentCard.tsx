import { AtSign, FileText, MapPin, MessageSquare, Phone, UserRound, Wifi, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TAB_IDS, type TabId } from '@/lib/types';
import { useQrStore } from '@/store/useQrStore';
import { EmailTab } from './tabs/EmailTab';
import { LocationTab } from './tabs/LocationTab';
import { PhoneTab } from './tabs/PhoneTab';
import { SmsTab } from './tabs/SmsTab';
import { TextTab } from './tabs/TextTab';
import { VCardTab } from './tabs/VCardTab';
import { WifiTab } from './tabs/WifiTab';

const ICONS: Record<TabId, LucideIcon> = {
  text: FileText,
  wifi: Wifi,
  vcard: UserRound,
  email: AtSign,
  sms: MessageSquare,
  phone: Phone,
  geo: MapPin,
};

export function ContentCard() {
  const { t } = useTranslation();
  const activeTab = useQrStore((s) => s.activeTab);
  const setActiveTab = useQrStore((s) => s.setActiveTab);

  return (
    <Card>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
        <TabsList aria-label={t('tabs.label')}>
          {TAB_IDS.map((id) => {
            const Icon = ICONS[id];
            return (
              <TabsTrigger key={id} value={id}>
                <Icon className="h-4 w-4" aria-hidden />
                {t(`tabs.${id}`)}
              </TabsTrigger>
            );
          })}
        </TabsList>
        <TabsContent value="text"><TextTab /></TabsContent>
        <TabsContent value="wifi"><WifiTab /></TabsContent>
        <TabsContent value="vcard"><VCardTab /></TabsContent>
        <TabsContent value="email"><EmailTab /></TabsContent>
        <TabsContent value="sms"><SmsTab /></TabsContent>
        <TabsContent value="phone"><PhoneTab /></TabsContent>
        <TabsContent value="geo"><LocationTab /></TabsContent>
      </Tabs>
    </Card>
  );
}
