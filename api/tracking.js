export default async function handler(req, res) {
  const trackingNumber =
    (req.query && req.query.trackingNumber) ||
    "JJD0000995743779301790274";

  const apiKey = process.env.DHL_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: "DHL_API_KEY no configurada",
      hint: "Añade DHL_API_KEY como variable de entorno en Vercel."
    });
  }

  try {
    const url = new URL("https://api-eu.dhl.com/track/shipments");
    url.searchParams.set("trackingNumber", trackingNumber);
    url.searchParams.set("service", "express");

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "DHL-API-Key": apiKey
      }
    });

    const body = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Error devuelto por DHL",
        details: body
      });
    }

    const raw = Array.isArray(body.shipments)
      ? body.shipments[0]
      : null;

    if (!raw) {
      return res.status(404).json({
        error: "Envío no encontrado",
        raw: body
      });
    }

    const events = Array.isArray(raw.events)
      ? raw.events.map((ev) => ({
          timestamp: ev.timestamp || ev.time || null,
          status:
            ev.status ||
            ev.description ||
            ev.statusCode ||
            "Movimiento DHL",
          location:
            ev.location?.address?.addressLocality ||
            ev.location?.address?.postalCode ||
            ev.location?.address?.countryCode ||
            ev.location?.description ||
            ""
        }))
      : [];

    return res.status(200).json({
      fetchedAt: new Date().toISOString(),
      shipment: {
        trackingNumber:
          raw.id ||
          raw.trackingNumber ||
          trackingNumber,
        status:
          raw.status?.statusCode ||
          raw.status?.description ||
          raw.status ||
          "",
        estimatedDelivery:
          raw.estimatedTimeOfDelivery ||
          raw.estimatedDeliveryTime ||
          raw.estimatedDeliveryDate ||
          null,
        events
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: "No se pudo consultar DHL",
      message:
        error instanceof Error
          ? error.message
          : String(error)
    });
  }
}
