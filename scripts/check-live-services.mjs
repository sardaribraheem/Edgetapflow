// Read-only service checks. Never log configuration values, responses or private documents.
import { readFile } from "node:fs/promises";
const env = Object.fromEntries((await readFile(".env.local","utf8")).split(/\r?\n/).filter(line=>line.trim() && !line.trim().startsWith("#")).map(line=>{
  const at=line.indexOf("="); return [line.slice(0,at).trim(),line.slice(at+1).trim().replace(/^['"]|['"]$/g,"")];
}));
async function check(label,url) {
  try {
    const response=await fetch(url,{headers:{Referer:"https://edgetapflow.web.app/"},signal:AbortSignal.timeout(15000)});
    console.log(`${label}: HTTP ${response.status}`);
    const data=await response.json().catch(()=>({}));
    if (!response.ok) {
      const reasons=(data.error?.details || []).map(detail=>detail.reason).filter(Boolean);
      console.log(`${label}: ${data.error?.status || "denied"}${reasons.length ? " ("+reasons.join(", ")+")" : ""}`);
    }
    return { response, data };
  } catch { console.log(`${label}: connection failed`); return null; }
}
const config=await check("Firebase Auth public configuration",`https://identitytoolkit.googleapis.com/v1/projects?key=${encodeURIComponent(env.NEXT_PUBLIC_FIREBASE_API_KEY)}`);
if (config?.response.ok) console.log("Launch host authorized:",config.data.authorizedDomains?.includes("edgetapflow.web.app")===true);
const project=encodeURIComponent(env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
await check("Public founder profile read",`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/profiles/ibraheem?key=${encodeURIComponent(env.NEXT_PUBLIC_FIREBASE_API_KEY)}`);
await check("Anonymous order list (must be denied)",`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/orders?pageSize=1&key=${encodeURIComponent(env.NEXT_PUBLIC_FIREBASE_API_KEY)}`);
await check("Anonymous Storage list (must be denied)",`https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)}/o?maxResults=1`);
