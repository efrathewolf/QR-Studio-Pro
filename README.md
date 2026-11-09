# QR Studio Pro

Generador avanzado de códigos QR con **Python + Streamlit**.

## Funciones
- QR para enlaces, texto, Wi-Fi, contacto vCard, correo, teléfono, SMS y ubicación.
- Personalización de colores, tamaño, nivel de corrección y borde.
- Inserción opcional de logotipo.
- Vista previa y descarga en PNG.
- Interfaz en español.

## Instalación local
1. Instala Python 3.10 o superior.
2. Descarga o clona este repositorio.
3. En la carpeta del proyecto ejecuta:

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

Abre la dirección local que Streamlit muestra en la terminal (normalmente http://localhost:8501).

## Uso
1. Selecciona el tipo de QR en la barra lateral.
2. Introduce los datos solicitados.
3. Ajusta colores, tamaño y corrección de errores.
4. Pulsa **Generar código QR**.
5. Descarga el PNG.

## Despliegue
Puede desplegarse en Streamlit Community Cloud conectando este repositorio y seleccionando `app.py`.

## Estructura
- `app.py`: aplicación Streamlit.
- `qr_core.py`: generación y validación del contenido QR.
- `requirements.txt`: dependencias.
- `.streamlit/config.toml`: tema visual.

## Licencia
MIT.
