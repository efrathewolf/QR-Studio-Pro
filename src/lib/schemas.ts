import { z } from 'zod';
import type { ContentMap } from './types';
import { validLat, validLon } from './payload';

/**
 * Esquemas de validación por pestaña. Los mensajes son claves de i18n
 * (se traducen al renderizar), así no hay texto hardcodeado.
 */
const str = z.string();
const emailLike = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const optionalEmail = str.refine((v) => v.trim() === '' || emailLike.test(v.trim()), 'errors.email');

export const textSchema: z.ZodType<ContentMap['text']> = z.object({ text: str });

export const wifiSchema: z.ZodType<ContentMap['wifi']> = z.object({
  ssid: str,
  password: str,
  encryption: z.enum(['nopass', 'WPA', 'WEP']),
  hidden: z.boolean(),
});

export const vcardSchema: z.ZodType<ContentMap['vcard']> = z.object({
  first: str,
  last: str,
  org: str,
  jobtitle: str,
  phone: str,
  email: optionalEmail,
  website: str,
  street: str,
  city: str,
  zip: str,
  country: str,
});

export const emailSchema: z.ZodType<ContentMap['email']> = z.object({
  to: optionalEmail,
  subject: str,
  body: str,
});

export const smsSchema: z.ZodType<ContentMap['sms']> = z.object({ number: str, message: str });
export const phoneSchema: z.ZodType<ContentMap['phone']> = z.object({ number: str });

export const geoSchema: z.ZodType<ContentMap['geo']> = z.object({
  lat: str.refine((v) => v.trim() === '' || validLat(v), 'errors.lat'),
  lon: str.refine((v) => v.trim() === '' || validLon(v), 'errors.lon'),
});
