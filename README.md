# 0-altoke

Aplicación de Tienda Comida con Vite + React (Vite).

## Variables de Entorno

Copia `.env.example` a `.env` y ajusta valores:

```
VITE_DESCUENTO=5
VITE_OFERTA=8500
VITE_CONTACT_PHONE=549000000000
VITE_ATTENTION_DAYS=Lun a Dom 19:00–24:00
VITE_WHATSAPP_REPLY=¡Gracias por tu pedido! 😊
VITE_WHATSAPP_NUMBER=549000000000
VITE_LOGO_PATH=/logo-altoke.png
```

## Deploy en Vercel

- Proyecto: Importar repo desde GitHub.
- Build: `npm run build` — Output: `dist`.
- Framework: Vite (detectado automáticamente).
- Variables: Configurarlas en Project Settings → Environment Variables (usar las del bloque anterior).

## Deploy en Netlify

- Site: Importar repo desde GitHub.
- Build command: `npm run build` — Publish directory: `dist`.
- Variables: Site Settings → Build & deploy → Environment (agregar las del bloque anterior).