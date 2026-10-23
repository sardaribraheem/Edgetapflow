// NTAG215: 504 user bytes; factory Capability Container advertises 496 NDEF bytes.
// https://www.nxp.com/docs/en/data-sheet/NTAG213_215_216.pdf, section 8.5.
// Budget an uncompressed, single URI record so prefix compression is not required.
export const NTAG215_NDEF_BYTES = 496;
export function normaliseDirectLink(value:string):string {
 const raw=value.trim();
 if(!raw)return '';
 try{return new URL(/^https?:\/\//i.test(raw)?raw:`https://${raw}`).href;}catch{return raw;}
}
export function nfcLinkSize(value:string){
 const url=normaliseDirectLink(value),urlBytes=new TextEncoder().encode(url).length;
 const payloadBytes=1+urlBytes; // URI identifier code 0 (no prefix abbreviation)
 const recordBytes=(payloadBytes<=255?4:7)+payloadBytes;
 const bytes=(recordBytes<255?2:4)+recordBytes+1; // NDEF TLV and terminator
 return {url,urlBytes,bytes,capacity:NTAG215_NDEF_BYTES,fits:bytes<=NTAG215_NDEF_BYTES};
}
export function directLinkError(value:string):string {
 if(!value.trim())return 'Paste the link your card should open.';
 if(/[\s\x00-\x1f\x7f]/.test(value.trim()))return 'Use a complete website link without spaces.';
 try {const u=new URL(normaliseDirectLink(value));if(!['https:','http:'].includes(u.protocol)||!u.hostname.includes('.')||u.username||u.password||u.hostname.endsWith('.local')||u.hostname==='localhost'||/^127\.|^10\.|^192\.168\.|^169\.254\.|^172\.(1[6-9]|2\d|3[01])\./.test(u.hostname))return 'Use a public http or https link.';}catch{return 'Paste a complete website link.';}
 return nfcLinkSize(value).fits?'':'This link is too long for the card. Use a shorter public link.';
}

// Derive the gallery from the saved destination so guest/cloud recovery agrees.
export function directLinkChannel(value:string):string {
 try {const host=new URL(value).hostname.toLowerCase().replace(/^www\./,'');
 if(host==='wa.me'||host==='whatsapp.com'||host.endsWith('.whatsapp.com'))return 'whatsapp';
 for(const channel of ['instagram','linkedin','tiktok','github'])if(host===channel+'.com'||host.endsWith('.'+channel+'.com'))return channel;
 }catch{}
 return '';
}
