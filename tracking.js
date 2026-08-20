export default async function handler(req,res){
  const trackingNumber=req.query?.trackingNumber;
  if(!trackingNumber)return res.status(400).json({error:"trackingNumber requerido"});
  const apiKey=process.env.TRACK17_API_KEY;
  if(!apiKey)return res.status(503).json({error:"TRACK17_API_KEY no configurada"});
  try{
    await fetch("https://api.17track.net/track/v2.2/register",{method:"POST",headers:{"Content-Type":"application/json","17token":apiKey},body:JSON.stringify([{number:trackingNumber}])});
    const r=await fetch("https://api.17track.net/track/v2.2/gettrackinfo",{method:"POST",headers:{"Content-Type":"application/json","17token":apiKey},body:JSON.stringify([{number:trackingNumber}])});
    const body=await r.json();
    if(!r.ok)return res.status(r.status).json({error:"Error 17TRACK",details:body});
    const item=body?.data?.accepted?.[0]||body?.data?.[0]||body?.accepted?.[0];
    if(!item)return res.status(404).json({error:"Envío no encontrado",raw:body});
    const track=item.track||item,provider=(track.providers||[])[0]||{};
    const raw=provider.events||track.events||track.track_info?.tracking||[];
    const events=(Array.isArray(raw)?raw:[]).map(e=>({timestamp:e.time_iso||e.time_utc||e.time||e.date||null,status:e.description||e.status||e.stage||"Movimiento",location:e.location||e.city||e.address||"",lat:Number.isFinite(Number(e.lat))?Number(e.lat):null,lon:Number.isFinite(Number(e.lng))?Number(e.lng):Number.isFinite(Number(e.lon))?Number(e.lon):null}));
    const status=track.latest_status?.status||track.latest_status?.sub_status||track.status||provider.latest_status?.status||"";
    const carrier=provider.provider?.name||provider.name||track.carrier||"Auto";
    const estimatedDelivery=track.estimated_delivery_date?.to||track.estimated_delivery_date?.from||track.estimated_delivery||null;
    return res.status(200).json({fetchedAt:new Date().toISOString(),shipment:{trackingNumber,carrier,status,estimatedDelivery,delivered:/delivered|livré|entregado/i.test(String(status)),events}});
  }catch(e){return res.status(500).json({error:"No se pudo consultar 17TRACK",message:e?.message||String(e)})}
}