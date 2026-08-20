# Pixel Dragon Tracker

Web personal para visualizar el viaje del Pixel hasta **Avallon** con una estética anime/radar inspirada en Dragon Ball, sin usar logotipos ni ilustraciones oficiales.

## Qué hace

- Muestra en un mapa la ruta conocida:
  **Eindhoven → Bruselas → París → Sainte-Savine → Avallon**
- Consulta el tracking de DHL mediante un backend serverless.
- Actualiza automáticamente cada **10 minutos**.
- Incluye un botón de actualización manual.
- Mantiene la clave de DHL fuera del navegador.
- Si la API aún no está configurada, enseña como respaldo los últimos eventos ya conocidos.

## Desplegar en Vercel

1. Crea una cuenta gratuita en Vercel.
2. Sube esta carpeta a un repositorio de GitHub o importa el proyecto directamente.
3. En DHL Developer Portal, crea una app y solicita acceso a:
   **Shipment Tracking - Unified**.
4. Copia tu Consumer Key.
5. En Vercel:
   **Project → Settings → Environment Variables**
6. Añade:
   `DHL_API_KEY = TU_CONSUMER_KEY`
7. Vuelve a desplegar.

La web llamará a:
`/api/tracking?trackingNumber=JJD0000995743779301790274`

El backend consulta la API oficial Unified Tracking de DHL:
`https://api-eu.dhl.com/track/shipments`

## Nota sobre actualización

El navegador consulta el backend cada 10 minutos mientras la página está abierta.
Esto evita exponer la API key de DHL.

## Privacidad

El destino del mapa es únicamente **Avallon**, no una dirección concreta.

## Créditos

Mapa: OpenStreetMap / Leaflet.
Tracking: Deutsche Post DHL Group.
