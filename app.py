from io import BytesIO
import streamlit as st
from PIL import Image
from qr_core import make_qr, png_bytes

st.set_page_config(page_title="QR Studio Pro", page_icon="🔳", layout="wide")
st.title("🔳 QR Studio Pro")
st.caption("Crea códigos QR personalizados para compartir información en segundos.")

KINDS = ["Enlace web", "Texto", "Wi-Fi", "Contacto (vCard)", "Correo", "Teléfono", "SMS", "Ubicación"]

def build_payload(kind: str) -> str:
    if kind == "Enlace web":
        return st.text_input("URL", placeholder="https://ejemplo.com")
    if kind == "Texto":
        return st.text_area("Texto", placeholder="Escribe el mensaje que contendrá el QR")
    if kind == "Wi-Fi":
        ssid = st.text_input("Nombre de red (SSID)")
        password = st.text_input("Contraseña", type="password")
        security = st.selectbox("Seguridad", ["WPA", "WEP", "nopass"])
        hidden = st.checkbox("Red oculta")
        esc = lambda x: x.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace(":", "\\:").replace('"', '\\"')
        return f'WIFI:T:{security};S:{esc(ssid)};P:{esc(password)};H:{str(hidden).lower()};;' if ssid else ""
    if kind == "Contacto (vCard)":
        c1, c2 = st.columns(2)
        with c1:
            first = st.text_input("Nombre")
            phone = st.text_input("Teléfono")
        with c2:
            last = st.text_input("Apellidos")
            email = st.text_input("Correo electrónico")
        org = st.text_input("Empresa (opcional)")
        return "\\n".join(["BEGIN:VCARD", "VERSION:3.0", f"N:{last};{first}", f"FN:{first} {last}".strip(), f"ORG:{org}" if org else "", f"TEL:{phone}" if phone else "", f"EMAIL:{email}" if email else "", "END:VCARD"])
    if kind == "Correo":
        address = st.text_input("Correo destinatario")
        subject = st.text_input("Asunto")
        body = st.text_area("Mensaje")
        from urllib.parse import quote
        return f"mailto:{address}?subject={quote(subject)}&body={quote(body)}" if address else ""
    if kind == "Teléfono":
        phone = st.text_input("Número telefónico", placeholder="+52...")
        return f"tel:{phone}" if phone else ""
    if kind == "SMS":
        phone = st.text_input("Número destino")
        message = st.text_area("Mensaje SMS")
        from urllib.parse import quote
        return f"sms:{phone}?body={quote(message)}" if phone else ""
    if kind == "Ubicación":
        c1, c2 = st.columns(2)
        lat = c1.text_input("Latitud", placeholder="20.6597")
        lon = c2.text_input("Longitud", placeholder="-103.3496")
        return f"geo:{lat},{lon}" if lat and lon else ""
    return ""

with st.sidebar:
    st.header("⚙️ Configuración")
    kind = st.selectbox("Tipo de código QR", KINDS)
    st.divider()
    foreground = st.color_picker("Color del QR", "#111827")
    background = st.color_picker("Color de fondo", "#FFFFFF")
    box_size = st.slider("Resolución", 4, 20, 10)
    border = st.slider("Margen", 2, 8, 4)
    error_level = st.selectbox("Corrección de errores", ["Bajo (7%)", "Medio (15%)", "Alto (25%)", "Muy alto (30%)"], index=2)
    logo_file = st.file_uploader("Logotipo opcional (PNG/JPG)", type=["png", "jpg", "jpeg"])

left, right = st.columns([1, 1], gap="large")
with left:
    st.subheader("1. Contenido")
    payload = build_payload(kind)
    st.caption("Consejo: prueba el QR con otro teléfono antes de imprimirlo.")
    generate = st.button("✨ Generar código QR", type="primary", use_container_width=True)

if "qr_png" not in st.session_state:
    st.session_state.qr_png = None
if generate:
    try:
        logo = Image.open(BytesIO(logo_file.getvalue())).convert("RGBA") if logo_file else None
        image = make_qr(payload, foreground=foreground, background=background,
                        box_size=box_size, border=border, error_level=error_level, logo=logo)
        st.session_state.qr_png = png_bytes(image)
        st.session_state.qr_payload = payload
    except Exception as exc:
        st.error(f"No se pudo generar el QR: {exc}")

with right:
    st.subheader("2. Vista previa y descarga")
    if st.session_state.qr_png:
        st.image(st.session_state.qr_png, caption="Tu código QR", width=340)
        st.download_button("⬇️ Descargar QR en PNG", data=st.session_state.qr_png,
                           file_name="qr-studio-pro.png", mime="image/png", type="primary",
                           use_container_width=True)
        with st.expander("Ver contenido codificado"):
            st.code(st.session_state.qr_payload, language="text")
    else:
        st.info("Completa los datos y pulsa Generar código QR para ver aquí el resultado.")

st.divider()
st.markdown("**Privacidad:** la generación se realiza dentro de la sesión de esta aplicación. No introduzcas contraseñas u otra información sensible en servicios públicos.")
