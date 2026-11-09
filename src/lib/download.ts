import { format as formatDate } from 'date-fns';
import type { ExportFormat, TabId } from './types';

const MIME: Record<ExportFormat, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  svg: 'image/svg+xml',
};

/** Rasteriza el SVG a PNG/JPG. JPG siempre sobre fondo blanco, calidad 0.95. */
export async function rasterize(svg: string, sizePx: number, fmt: 'png' | 'jpg'): Promise<Blob> {
  // Mínimo ~1024 px de lado para que el archivo sea nítido al imprimir.
  const scale = Math.max(1, Math.ceil(1024 / sizePx));
  const side = sizePx * scale;

  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();

    const canvas = document.createElement('canvas');
    canvas.width = side;
    canvas.height = side;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    if (fmt === 'jpg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, side, side);
    }
    ctx.drawImage(img, 0, 0, side, side);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))),
        MIME[fmt],
        fmt === 'jpg' ? 0.95 : undefined,
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function buildFilename(tab: TabId, fmt: ExportFormat, date = new Date()): string {
  return `qr-${tab}-${formatDate(date, 'yyyyMMdd-HHmmss')}.${fmt}`;
}

/* File System Access API (sin tipos estables en lib.dom). */
interface WritableLike {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
}
interface HandleLike {
  createWritable(): Promise<WritableLike>;
}
interface PickerWindow {
  showSaveFilePicker?: (options: {
    suggestedName: string;
    types: { description: string; accept: Record<string, string[]> }[];
  }) => Promise<HandleLike>;
}

export type SaveResult = 'saved' | 'cancelled';

/**
 * Guarda un Blob: usa showSaveFilePicker cuando existe y, si no,
 * descarga directa con <a download>.
 */
export async function saveBlob(
  blob: Blob, filename: string, fmt: ExportFormat, description: string,
): Promise<SaveResult> {
  const picker = (window as unknown as PickerWindow).showSaveFilePicker;
  if (picker) {
    try {
      const handle = await picker.call(window, {
        suggestedName: filename,
        types: [{ description, accept: { [MIME[fmt]]: [`.${fmt}`] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return 'saved';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
      // Cualquier otro fallo del selector: se cae a la descarga directa.
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return 'saved';
}
