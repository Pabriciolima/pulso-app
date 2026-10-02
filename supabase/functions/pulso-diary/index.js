import {validateReading} from './safety.mjs';
const base=Deno.env.get('SUPABASE_URL');
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function db(path,method='GET',body){
 const r=await fetch(base+'/rest/v1/'+path,{method,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw new Error('database');
 return r.status===204?null:r.json();
}
Deno.serve(async req=>{
 const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type,apikey,x-pulso-access','Access-Control-Allow-Methods':'GET,POST,PATCH,DELETE,OPTIONS','Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
 const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(!['GET','POST','PATCH','DELETE'].includes(req.method))return reply({message:'Método não permitido.'},405);
 const token=req.headers.get('x-pulso-access')||'';
 if(!/^[A-Za-z0-9_-]{43}$/.test(token))return reply({message:'Abra pelo seu link pessoal para acessar o diário.'},401);
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))).map(v=>v.toString(16).padStart(2,'0')).join('');
 try{
  const diaries=await db('pulso_diaries?select=id&access_hash=eq.'+hash+'&limit=1');
  if(!diaries.length)return reply({message:'Este link pessoal não é válido. Use o link que recebeu.'},401);
  const diary=diaries[0].id,expiry=new Date(Date.now()-60*86400000).toISOString();
  const scope='diary_id=eq.'+diary+'&created_at=gt.'+encodeURIComponent(expiry);
  if(req.method==='GET')return reply(await db('pulso_readings?select=id,measured_at,period,systolic,diastolic,pulse,symptoms,notes,created_at&'+scope+'&order=measured_at.desc&limit=2000'));
  const id=new URL(req.url).searchParams.get('id');
  if(req.method!=='POST'&&(!id||!uuid.test(id)))return reply({message:'Medição inválida.'},400);
  if(req.method==='DELETE')return reply(await db('pulso_readings?id=eq.'+id+'&'+scope,'DELETE'));
  const raw=await req.text();if(raw.length>10000)return reply({message:'Registro muito grande.'},413);
  let input;try{input=JSON.parse(raw)}catch{return reply({message:'Registro inválido.'},400)}
  const allowedSymptoms=['Dor / pressão forte no peito','Falta de ar','Dor de cabeça','Dor de cabeça súbita e intensa','Tontura','Desmaio','Alteração da visão / fala ou fraqueza'];
  if(!Array.isArray(input.symptoms)||input.symptoms.length>7||input.symptoms.some(s=>!allowedSymptoms.includes(s)))return reply({message:'Confira os sintomas selecionados.'},400);
  if(typeof input.notes!=='string'||input.notes.length>1000)return reply({message:'A observação pode ter até 1.000 caracteres.'},400);
  const record={systolic:input.systolic,diastolic:input.diastolic,pulse:input.pulse,period:input.period,measured_at:input.measured_at,symptoms:[...new Set(input.symptoms)],notes:input.notes.trim()};
  try{validateReading(record)}catch(e){return reply({message:e.message},400)}
  if(req.method==='POST'){
   const recent=await db('pulso_readings?select=id&diary_id=eq.'+diary+'&created_at=gt.'+encodeURIComponent(new Date(Date.now()-60000).toISOString())+'&limit=61');
   if(recent.length>=60)return reply({message:'Muitos registros em sequência. Aguarde um minuto e tente novamente.'},429);
   if(input.id&&!uuid.test(input.id))return reply({message:'Identificador inválido.'},400);
   return reply(await db('pulso_readings','POST',{...record,id:input.id||crypto.randomUUID(),diary_id:diary,user_id:null}),201);
  }
  return reply(await db('pulso_readings?id=eq.'+id+'&'+scope,'PATCH',record));
 }catch{return reply({message:'Não consegui conectar com seu diário agora. Tente novamente em instantes.'},503)}
});
