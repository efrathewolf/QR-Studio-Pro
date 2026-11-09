import type { ContentMap, TabId } from './types';

/** Wi-Fi: escapa \ ; , : " (igual que la app original). */
export function wifiEscape(text: string): string {
  return text.replace(/([\\;,:"])/g, '\\$1');
}

/** vCard: escapa \ ; , y saltos de línea. */
export function vcardEscape(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/** Equivalente a urllib.parse.quote (safe="/") para igualar los mailto: de la app original. */
export function pyQuote(text: string): string {
  return encodeURIComponent(text)
    .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%2F/g, '/');
}

/** Acepta coma o punto decimal. Devuelve null si no es un número finito. */
export function parseCoord(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (normalized === '') return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export function validLat(value: string): boolean {
  const n = parseCoord(value);
  return n !== null && n >= -90 && n <= 90;
}

export function validLon(value: string): boolean {
  const n = parseCoord(value);
  return n !== null && n >= -180 && n <= 180;
}

/**
 * Construye el payload exacto según la pestaña activa.
 * Devuelve null cuando faltan datos obligatorios (estado "vacío").
 */
export function buildPayload(tab: TabId, content: ContentMap): string | null {
  switch (tab) {
    case 'text': {
      const v = content.text.text.trim();
      return v || null;
    }
    case 'wifi': {
      const { ssid, password, encryption, hidden } = content.wifi;
      if (!ssid.trim()) return null;
      let out = `WIFI:T:${encryption};S:${wifiEscape(ssid.trim())};`;
      if (encryption !== 'nopass') out += `P:${wifiEscape(password)};`;
      return out + `H:${hidden ? 'true' : 'false'};;`;
    }
    case 'vcard': {
      const c = content.vcard;
      const first = c.first.trim();
      const last = c.last.trim();
      if (!first && !last && !c.phone.trim() && !c.email.trim()) return null;
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${vcardEscape(last)};${vcardEscape(first)};;;`,
        `FN:${vcardEscape(`${first} ${last}`.trim())}`,
      ];
      const optional: [string, string][] = [
        ['ORG', c.org],
        ['TITLE', c.jobtitle],
        ['TEL;TYPE=CELL', c.phone],
        ['EMAIL', c.email],
        ['URL', c.website],
      ];
      for (const [tag, raw] of optional) {
        const v = raw.trim();
        if (v) lines.push(`${tag}:${vcardEscape(v)}`);
      }
      if ([c.street, c.city, c.zip, c.country].some((v) => v.trim())) {
        lines.push(
          `ADR;TYPE=WORK:;;${vcardEscape(c.street)};${vcardEscape(c.city)};;${vcardEscape(c.zip)};${vcardEscape(c.country)}`,
        );
      }
      lines.push('END:VCARD');
      return lines.join('\r\n');
    }
    case 'email': {
      const { to, subject, body } = content.email;
      if (!to.trim()) return null;
      const params: string[] = [];
      if (subject.trim()) params.push('subject=' + pyQuote(subject.trim()));
      if (body.trim()) params.push('body=' + pyQuote(body.trim()));
      return `mailto:${to.trim()}${params.length ? '?' + params.join('&') : ''}`;
    }
    case 'sms': {
      const { number, message } = content.sms;
      if (!number.trim()) return null;
      return `SMSTO:${number.trim()}:${message.trim()}`;
    }
    case 'phone': {
      const n = content.phone.number.trim();
      return n ? `tel:${n}` : null;
    }
    case 'geo': {
      const { lat, lon } = content.geo;
      if (!validLat(lat) || !validLon(lon)) return null;
      return `geo:${parseCoord(lat)},${parseCoord(lon)}`;
    }
  }
}
