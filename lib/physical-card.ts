import templates from './data/card-templates.json';
import type { Order } from './data/order';
import { isProfileDestination } from './site';

export const CARD_WIDTH_MM = 85.60;
export const CARD_HEIGHT_MM = 53.98;
export type CardFace = 'front' | 'back';
export type CardTemplateDefinition = (typeof templates)[number] & {frontBackground?: string; backBackground?: string; artworkMode?:string; preview?:string};
export const PRINT_TEMPLATES: CardTemplateDefinition[] = templates;
export const templateFor = (id:string,version?:number) => PRINT_TEMPLATES.filter(t=>t.id===id&&(version===undefined||t.version===version)).sort((a,b)=>b.version-a.version)[0];
export const CARD_FONTS = ['Arial','Georgia','Verdana','Courier New'] as const;
export type CardText = {id:string;text:string;binding?:'name'|'title';x:number;y:number;sizeMm:number;font:(typeof CARD_FONTS)[number];colour:string;bold:boolean;rotation?:number};
export type CardBackground = {colour:string;gradient?:{end:string;angle:number}};
export type CardEditor = {front:{background:CardBackground;text:CardText[]};back:{background:CardBackground;text:CardText[]}};
export function blankCardEditor():CardEditor {return {front:{background:{colour:'#100b4a'},text:[{id:'name',text:'',binding:'name',x:.5,y:.43,sizeMm:5,font:'Arial',colour:'#ffffff',bold:true},{id:'title',text:'',binding:'title',x:.5,y:.63,sizeMm:3,font:'Arial',colour:'#ffffff',bold:false}]},back:{background:{colour:'#100b4a'},text:[]}};}
export type PhysicalCard = {
  schemaVersion: 1 | 2;
  editor?: CardEditor;
  templateVersion: number;
  useProfileName: boolean;
  useProfileTitle: boolean;
  printedName?: string;
  logoUrl?: string;
  printedTitle?: string;
  backDesignUrl?: string;
  preparedFrontSource?: string;
  preparedBackSource?: string;
  standardBack: boolean;
  qr: {enabled: boolean; placement: 'centre' | 'marked'; face: CardFace; x: number; y: number; sizeMm: number};
};
export type PrintSettings = {dpi: 300 | 600; bleedMm: number; safeMm: number; colour: 'rgb' | 'cmyk'; orientation: 'long-edge' | 'short-edge'; confirmed: boolean};
export const DEFAULT_PRINT_SETTINGS: PrintSettings = {dpi:600,bleedMm:0,safeMm:3,colour:'rgb',orientation:'long-edge',confirmed:false};
export const blankPhysicalCard = (template = 'simple'): PhysicalCard => ({schemaVersion:2,...(template==='custom'?{editor:blankCardEditor()}:{}),templateVersion:templateFor(template)?.version||1,useProfileName:true,useProfileTitle:true,standardBack:true,qr:{enabled:true,placement:'centre',face:'back',x:.5,y:.5,sizeMm:20}});
export type PrintSnapshot = {revision: number; template: CardTemplateDefinition | null; physical: PhysicalCard; name: string; title: string; profileUrl: string; quantity: number; settings: PrintSettings; frontPath: string; backPath: string; pdfPath: string; ready?: boolean};
export function printedWords(card: PhysicalCard, name: string, title: string) {return {name:card.useProfileName?name:card.printedName||'',title:card.useProfileTitle?title:card.printedTitle||''};}
export function physicalCardError(card: PhysicalCard, template: string, front?: string, requireFiles = true): string {
  if(![1,2].includes(card.schemaVersion)||(template==='upload'?card.templateVersion!==1:!templateFor(template,card.templateVersion)))return 'This card design changed. Select it again.';
  if(template!=='upload'&&!templateFor(template))return 'This card design is unavailable in this version.';
  if(card.logoUrl&&!/^https:\/\/[a-z0-9-]+[.]supabase[.]co\/storage\/v1\/object\/public\/avatars\//.test(card.logoUrl))return 'Choose your uploaded logo again.';
  if((card.printedName!==undefined&&(!card.printedName.trim()||card.printedName.length>120))||(card.printedTitle||'').length>160)return 'Check the printed name and title.';
  if(template==='upload'&&requireFiles&&(!front||((card.schemaVersion===2||!card.standardBack)&&!card.backDesignUrl)))return 'Choose front and back artwork, or use the standard back.';
  const q=card.qr;
  if(!q||!['front','back'].includes(q.face)||!['centre','marked'].includes(q.placement)||![q.x,q.y,q.sizeMm].every(Number.isFinite)||q.sizeMm<16||q.sizeMm>28)return 'Check the QR position and size.';
  if(card.schemaVersion===1&&template!=='upload'&&(!q.enabled||q.placement!=='centre'||q.face!=='back'||q.x!==.5||q.y!==.5))return 'Preset cards use the fixed QR layout.';
  if(q.enabled&&(q.x*CARD_WIDTH_MM-q.sizeMm/2<3||q.x*CARD_WIDTH_MM+q.sizeMm/2>CARD_WIDTH_MM-3||q.y*CARD_HEIGHT_MM-q.sizeMm/2<3||q.y*CARD_HEIGHT_MM+q.sizeMm/2>CARD_HEIGHT_MM-3))return 'Keep the QR fully inside the card, away from the edges.';
  if(template==='custom'&&!card.editor)return 'Open the card customizer to finish your design.';
  if(card.editor){for(const side of [card.editor.front,card.editor.back]){if(!side||!/^#[0-9a-f]{6}$/i.test(side.background.colour)||side.text.length>12)return 'Check your card colours and text.';if(side.background.gradient&&(!/^#[0-9a-f]{6}$/i.test(side.background.gradient.end)||!Number.isFinite(side.background.gradient.angle)||side.background.gradient.angle<0||side.background.gradient.angle>360))return 'Check your gradient.';for(const t of side.text){if(t.text.length>160||(t.rotation!==undefined&&(!Number.isFinite(t.rotation)||t.rotation< -180||t.rotation>180))||!CARD_FONTS.includes(t.font)||!/^#[0-9a-f]{6}$/i.test(t.colour)||![t.x,t.y,t.sizeMm].every(Number.isFinite)||t.x<.04||t.x>.96||t.y<.06||t.y>.94||t.sizeMm<2||t.sizeMm>12)return 'Check your text position, size and colour.';}}}
  return '';
}
export function clampQrPosition(x:number,y:number,sizeMm:number,safeMm=3) {const safe=Math.max(3,safeMm),dx=(sizeMm/2+safe)/CARD_WIDTH_MM,dy=(sizeMm/2+safe)/CARD_HEIGHT_MM;return {x:Math.max(dx,Math.min(1-dx,x)),y:Math.max(dy,Math.min(1-dy,y))};}
export function printPackageHold(order: Order): string {
  if(!order.printSnapshot)return 'Prepare the front and back proof first.';
  if(order.applicationStatus!=='accepted'||order.payment.status!=='paid'||order.cardVerifiedAmount!==order.subtotal)return 'Accept the application and verify the card payment.';
  if(order.plan==='direct_link'?(!order.directLink||order.nfcUrl!==order.directLink):(!order.usernameFinal||!order.profileId||!isProfileDestination(order.nfcUrl,order.usernameFinal)))return 'Confirm the card destination before preparing its QR.';
  if(!order.printSnapshot.settings.confirmed)return 'Confirm the printer requirements.';
  if(order.printSnapshot.settings.colour!=='rgb')return 'CMYK conversion must be completed by your printer; this exporter produces RGB.';
  if(!['approved','approved_no_response'].includes(order.designProofStatus||''))return 'Complete the actual customer design-proof review.';
  if(!order.printSnapshot.ready)return 'Check the active profile, specification and current proof approval.';
  return '';
}
export function printerMessage(order:Order,snapshot:PrintSnapshot,proof=false) {
  const line=(value:string)=>value.replace(/[\x00-\x1f\x7f]/g,' ').trim();
  const base=`${order.orderNumber}-r${snapshot.revision}`,q=snapshot.physical.qr,s=snapshot.settings;
  return [proof?'DRAFT PROOF — DO NOT PRINT':`EdgeTap print job: ${order.orderNumber}`,`Order: ${order.orderNumber}`,`Quantity: ${snapshot.quantity} identical card${snapshot.quantity===1?'':'s'}`,`Material: PVC with NFC`,`Trim: ${CARD_WIDTH_MM.toFixed(2)} × ${CARD_HEIGHT_MM.toFixed(2)} mm`,`Print: front and back · ${s.orientation}`,`Output: ${s.dpi} dpi · ${s.bleedMm} mm bleed · RGB`,`Front wording: ${order.card.template==='upload'?'As supplied artwork':[line(snapshot.name),line(snapshot.title)].filter(Boolean).join(' / ')}`,`QR: ${q.enabled?`${q.face}, ${q.placement==='centre'?'centre':'marked position'}`:'omitted; NFC only'}`,`Artwork revision: ${snapshot.revision}`,`Files: ${base}.pdf, ${base}-front.png, ${base}-back.png`].join('\n');
}
