# QR Studio (PWA)

Creador de códigos QR avanzado: React 18 + TypeScript + Vite + Tailwind + shadcn-style (Radix),
Zustand, i18next (ES/EN/FR), react-hook-form + zod, sonner y vite-plugin-pwa.

## 1. Instalar

```bash
npm install
```

## 2. Desarrollo en local con HTTPS

```bash
npm run dev
```

Abre `https://localhost:5173`. `@vitejs/plugin-basic-ssl` genera un certificado autofirmado:
el navegador mostrará un aviso la primera vez (Avanzado → Continuar).
`geolocation` solo funciona en contexto seguro (HTTPS o `localhost`); para probarlo desde el
móvil usa la URL `https://<IP-de-tu-PC>:5173` que imprime Vite (**Network**).

## 3. Producir y probar el PWA

```bash
npm run build      # tsc + vite build → dist/
npm run preview    # sirve dist/ por HTTPS en :4173 (service worker activo)
```

El service worker solo se genera en `build`; para probar la instalación y el modo offline usa `preview`.

## 4. Desplegar (siempre sobre HTTPS)

- **Vercel / Netlify**: importa el repositorio. Build command `npm run build`, output `dist`.
  Ambas sirven HTTPS por defecto.
- **GitHub Pages** (subruta): compila con la base del repositorio,
  `BASE_PATH=/nombre-del-repo/ npm run build`, y publica `dist/` (p. ej. con `gh-pages -d dist`
  o una GitHub Action de Pages). Los iconos del `<head>` (`/icon.svg`) usan ruta absoluta:
  en subrutas cámbialos a rutas relativas (`icon.svg`).

## Estructura

```
src/
  main.tsx · App.tsx · index.css
  i18n/        i18n.ts + locales/{es,en,fr}.json
  store/       useQrStore.ts (Zustand)
  lib/         types · payload · schemas · svg (generador SVG) · download · utils
  hooks/       useGeolocation · useQrPayload · useSliceForm · useDebounce · useTheme · useInstallPrompt · useMediaQuery
  components/  Header · ContentCard · DesignPanel · QRPanel · ColorField · SliderField · InstallBanner
    tabs/      TextTab · WifiTab · VCardTab · EmailTab · SmsTab · PhoneTab · LocationTab · Field
    ui/        button · input · label · card · tabs · slider · select · switch · tooltip · popover · sheet
public/        iconos PWA (192, 512, maskable, apple-touch) + icon.svg
```
