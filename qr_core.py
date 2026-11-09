"""Core helpers for QR Studio Pro."""
from io import BytesIO
import qrcode
from qrcode.constants import ERROR_CORRECT_L, ERROR_CORRECT_M, ERROR_CORRECT_Q, ERROR_CORRECT_H
from PIL import Image

ERROR_LEVELS = {
    "Bajo (7%)": ERROR_CORRECT_L,
    "Medio (15%)": ERROR_CORRECT_M,
    "Alto (25%)": ERROR_CORRECT_Q,
    "Muy alto (30%)": ERROR_CORRECT_H,
}

def make_qr(data: str, *, foreground="#111827", background="#ffffff", box_size=10,
            border=4, error_level="Alto (25%)", logo=None) -> Image.Image:
    if not data or not data.strip():
        raise ValueError("Escribe o genera primero el contenido del QR.")
    qr = qrcode.QRCode(version=None, error_correction=ERROR_LEVELS[error_level],
                       box_size=int(box_size), border=int(border))
    qr.add_data(data.strip())
    qr.make(fit=True)
    image = qr.make_image(fill_color=foreground, back_color=background).convert("RGBA")
    if logo is not None:
        mark = logo.convert("RGBA")
        max_side = max(1, image.width // 5)
        mark.thumbnail((max_side, max_side))
        # White backing improves scan reliability around the logo.
        pad = max(8, image.width // 100)
        tile = Image.new("RGBA", (mark.width + 2 * pad, mark.height + 2 * pad), background)
        tile.alpha_composite(mark, (pad, pad))
        image.alpha_composite(tile, ((image.width - tile.width)//2, (image.height - tile.height)//2))
    return image.convert("RGB")

def png_bytes(image: Image.Image) -> bytes:
    out = BytesIO()
    image.save(out, format="PNG", optimize=True)
    return out.getvalue()
