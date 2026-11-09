/** Tipos y valores por defecto compartidos por toda la app. */

export const TAB_IDS = ['text', 'wifi', 'vcard', 'email', 'sms', 'phone', 'geo'] as const;
export type TabId = (typeof TAB_IDS)[number];

export type WifiEncryption = 'nopass' | 'WPA' | 'WEP';

export interface ContentMap {
  text: { text: string };
  wifi: { ssid: string; password: string; encryption: WifiEncryption; hidden: boolean };
  vcard: {
    first: string;
    last: string;
    org: string;
    jobtitle: string;
    phone: string;
    email: string;
    website: string;
    street: string;
    city: string;
    zip: string;
    country: string;
  };
  email: { to: string; subject: string; body: string };
  sms: { number: string; message: string };
  phone: { number: string };
  geo: { lat: string; lon: string };
}

export const EMPTY_CONTENT: ContentMap = {
  text: { text: '' },
  wifi: { ssid: '', password: '', encryption: 'WPA', hidden: false },
  vcard: {
    first: '', last: '', org: '', jobtitle: '', phone: '', email: '',
    website: '', street: '', city: '', zip: '', country: '',
  },
  email: { to: '', subject: '', body: '' },
  sms: { number: '', message: '' },
  phone: { number: '' },
  geo: { lat: '', lon: '' },
};

export const SHAPES = ['square', 'rounded', 'circle', 'gapped', 'vertical', 'horizontal'] as const;
export type ModuleShape = (typeof SHAPES)[number];

export const COLOR_MODES = ['solid', 'radial', 'square', 'h', 'v'] as const;
export type ColorMode = (typeof COLOR_MODES)[number];

export const EC_LEVELS = ['L', 'M', 'Q', 'H'] as const;
export type EcLevel = (typeof EC_LEVELS)[number];

export interface LogoData {
  dataUrl: string;
  name: string;
  width: number;
  height: number;
}

export interface DesignOptions {
  shape: ModuleShape;
  colorMode: ColorMode;
  fg: string;
  bg: string;
  grad: string;
  /** Tamaño de módulo en px (1–60). */
  box: number;
  /** Zona de silencio en módulos (0–30). */
  border: number;
  ec: EcLevel;
  logo: LogoData | null;
  /** Tamaño del logo en % del lado del QR (5–40). */
  logoSize: number;
}

export const DEFAULT_DESIGN: DesignOptions = {
  shape: 'square',
  colorMode: 'solid',
  fg: '#000000',
  bg: '#FFFFFF',
  grad: '#3B82F6',
  box: 10,
  border: 4,
  ec: 'M',
  logo: null,
  logoSize: 20,
};

export type ExportFormat = 'png' | 'jpg' | 'svg';
