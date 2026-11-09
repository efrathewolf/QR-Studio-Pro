import QRCode from 'qrcode';
import type { ColorMode, DesignOptions, EcLevel, ModuleShape } from './types';

export interface QrSvg {
  svg: string;
  /** Lado en píxeles = (módulos + 2·borde) · tamaño de módulo. */
  size: number;
}

/** Normaliza un color a #RRGGBB (misma lógica que safe_hex de la app original). */
export function safeHex(value: string, fallback: string): string {
  const v = value.trim();
  if (/^#?[0-9a-fA-F]{6}$/.test(v)) return '#' + v.replace('#', '').toUpperCase();
  if (/^#?[0-9a-fA-F]{3}$/.test(v)) {
    return '#' + v.replace('#', '').split('').map((c) => c + c).join('').toUpperCase();
  }
  return fallback;
}

/** Con logo, los niveles L y M suben automáticamente a H. */
export function effectiveEc(design: Pick<DesignOptions, 'ec' | 'logo'>): EcLevel {
  return design.logo && (design.ec === 'L' || design.ec === 'M') ? 'H' : design.ec;
}

const f = (n: number): number => Math.round(n * 1000) / 1000;

type Radii = [number, number, number, number]; // tl, tr, br, bl

/** Rectángulo con radios por esquina, como path SVG. */
function roundedRect(x: number, y: number, w: number, h: number, [tl, tr, br, bl]: Radii): string {
  const arc = (r: number, ex: number, ey: number) => (r ? `A${f(r)},${f(r)} 0 0 1 ${f(ex)},${f(ey)}` : '');
  return (
    `M${f(x + tl)},${f(y)}H${f(x + w - tr)}${arc(tr, x + w, y + tr)}` +
    `V${f(y + h - br)}${arc(br, x + w - br, y + h)}` +
    `H${f(x + bl)}${arc(bl, x, y + h - bl)}` +
    `V${f(y + tl)}${arc(tl, x + tl, y)}Z`
  );
}

type IsDark = (x: number, y: number) => boolean;

/** Geometría de todos los módulos oscuros, en unidades de módulo. */
function modulesPath(shape: ModuleShape, n: number, b: number, dark: IsDark): string {
  const parts: string[] = [];

  if (shape === 'square') {
    // Se fusionan las rachas horizontales para evitar costuras.
    for (let y = 0; y < n; y++) {
      let x = 0;
      while (x < n) {
        if (!dark(x, y)) { x++; continue; }
        const start = x;
        while (x < n && dark(x, y)) x++;
        parts.push(`M${start + b},${y + b}h${x - start}v1h${start - x}z`);
      }
    }
    return parts.join('');
  }

  if (shape === 'vertical' || shape === 'horizontal') {
    const vertical = shape === 'vertical';
    for (let a = 0; a < n; a++) {
      const on = (i: number) => (vertical ? dark(a, i) : dark(i, a));
      let s = 0;
      while (s < n) {
        if (!on(s)) { s++; continue; }
        const start = s;
        while (s < n && on(s)) s++;
        const len = s - start;
        parts.push(
          vertical
            ? roundedRect(a + b + 0.1, start + b, 0.8, len, [0.4, 0.4, 0.4, 0.4])
            : roundedRect(start + b, a + b + 0.1, len, 0.8, [0.4, 0.4, 0.4, 0.4]),
        );
      }
    }
    return parts.join('');
  }

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!dark(x, y)) continue;
      const px = x + b;
      const py = y + b;
      if (shape === 'circle') {
        parts.push(`M${px},${py + 0.5}a.5,.5 0 1,0 1,0a.5,.5 0 1,0 -1,0z`);
      } else if (shape === 'gapped') {
        parts.push(roundedRect(px + 0.1, py + 0.1, 0.8, 0.8, [0, 0, 0, 0]));
      } else {
        // rounded: solo se redondean las esquinas sin vecinos en ambos lados
        const up = dark(x, y - 1);
        const down = dark(x, y + 1);
        const left = dark(x - 1, y);
        const right = dark(x + 1, y);
        parts.push(
          roundedRect(px, py, 1, 1, [
            !up && !left ? 0.5 : 0,
            !up && !right ? 0.5 : 0,
            !down && !right ? 0.5 : 0,
            !down && !left ? 0.5 : 0,
          ]),
        );
      }
    }
  }
  return parts.join('');
}

function mix(a: string, b: string, t: number): string {
  const ch = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const c = (i: number) => Math.round(ch(a, i) + (ch(b, i) - ch(a, i)) * t).toString(16).padStart(2, '0');
  return `#${c(0)}${c(1)}${c(2)}`.toUpperCase();
}

/** Capa de color (se recorta con la forma de los módulos). */
function paint(
  mode: ColorMode, fg: string, grad: string, n: number, b: number, total: number,
): { defs: string; body: string } {
  const full = `width="${total}" height="${total}"`;
  switch (mode) {
    case 'solid':
      return { defs: '', body: `<rect ${full} fill="${fg}"/>` };
    case 'radial':
      return {
        defs: `<radialGradient id="qr-g" cx=".5" cy=".5" r=".7071"><stop offset="0" stop-color="${fg}"/><stop offset="1" stop-color="${grad}"/></radialGradient>`,
        body: `<rect ${full} fill="url(#qr-g)"/>`,
      };
    case 'h':
    case 'v': {
      const [x2, y2] = mode === 'h' ? [1, 0] : [0, 1];
      return {
        defs: `<linearGradient id="qr-g" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${fg}"/><stop offset="1" stop-color="${grad}"/></linearGradient>`,
        body: `<rect ${full} fill="url(#qr-g)"/>`,
      };
    }
    case 'square': {
      // Anillos concéntricos por distancia de Chebyshev al centro (borde → centro).
      const c = (n - 1) / 2;
      const maxR = Math.max(1, Math.floor(n / 2));
      let rects = `<rect ${full} fill="${grad}"/>`;
      for (let r = maxR; r >= 0; r--) {
        rects += `<rect x="${b + c - r}" y="${b + c - r}" width="${2 * r + 1}" height="${2 * r + 1}" fill="${mix(fg, grad, r / maxR)}"/>`;
      }
      return { defs: '', body: rects };
    }
  }
}

/** Genera el SVG real del QR con forma, color, degradado y logo. */
export function buildQrSvg(data: string, d: DesignOptions): QrSvg {
  const qr = QRCode.create(data, { errorCorrectionLevel: effectiveEc(d) });
  const n = qr.modules.size;
  const total = n + 2 * d.border;
  const size = total * d.box;
  const dark: IsDark = (x, y) => x >= 0 && y >= 0 && x < n && y < n && qr.modules.get(y, x) === 1;

  const fg = safeHex(d.fg, '#000000');
  const bg = safeHex(d.bg, '#FFFFFF');
  const grad = safeHex(d.grad, '#3B82F6');

  const path = modulesPath(d.shape, n, d.border, dark);
  const { defs, body } = paint(d.colorMode, fg, grad, n, d.border, total);

  let logo = '';
  if (d.logo) {
    const target = (total * d.logoSize) / 100;
    const ratio = d.logo.width / d.logo.height;
    const lw = ratio >= 1 ? target : target * ratio;
    const lh = ratio >= 1 ? target / ratio : target;
    const pad = target / 12;
    const bw = lw + 2 * pad;
    const bh = lh + 2 * pad;
    const bx = (total - bw) / 2;
    const by = (total - bh) / 2;
    logo =
      `<rect x="${f(bx)}" y="${f(by)}" width="${f(bw)}" height="${f(bh)}" fill="#FFFFFF"/>` +
      `<image x="${f(bx + pad)}" y="${f(by + pad)}" width="${f(lw)}" height="${f(lh)}" ` +
      `href="${d.logo.dataUrl}" xlink:href="${d.logo.dataUrl}" preserveAspectRatio="xMidYMid meet"/>`;
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `width="${size}" height="${size}" viewBox="0 0 ${total} ${total}">` +
    `<defs><clipPath id="qr-m"><path d="${path}"/></clipPath>${defs}</defs>` +
    `<rect width="${total}" height="${total}" fill="${bg}"/>` +
    `<g clip-path="url(#qr-m)">${body}</g>${logo}</svg>`;

  return { svg, size };
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
