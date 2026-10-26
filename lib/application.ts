import type {PricingCatalog} from '@/lib/pricing';
import type { CheckoutMethod } from './checkout';
import { normaliseDirectLink } from './nfc-link';
import { STANDARD_CARD_SIZE } from './data/order';
import { getSupabase } from './supabase';
import type { Order, CardTemplateId, CustomerInfo, DeliveryMethod, PaymentInfo } from './data/order';
import type { ProfileLink } from './data/profile';
import { blankPhysicalCard, printedWords, type PhysicalCard, type PrintSettings, type PrintSnapshot } from './physical-card';

export type ApplicationPayload = {
  pricingVersion?:3|4; pricingCatalogVersion?:number; offer?:'two_card_bundle'|'three_card_bundle'; existingProfileId?:string;
  product?: 'direct_link' | 'profile';
  directLink?: string;
  customerNotes?: string;
  card: { template: CardTemplateId; quantity: number; size: string; customDesignUrl?: string; physical?: PhysicalCard };
  customer: CustomerInfo;
  profileDraft: { displayName: string; title: string; bio: string; location?:string; handleEdited?:boolean; usernameSuggested: string; avatarUrl?: string; links: ProfileLink[] };
  deliveryMethod: DeliveryMethod;
  payment: { method: CheckoutMethod; receiptUrl?: string; reference?: string };
};
export type ApplicationDraft = { id: string; orderId?: string; payload: ApplicationPayload; step: number; version: number; state: 'draft' | 'changes_required'; updatedAt: number };
export type OrderSettings = { pickupDetails: string; deliveryDetails: string; hostingDetails: string; cardSizes: string[]; cardDimensions: string; designProofScope: 'pending'|'all_personalized'|'uploaded_only'; jazzcashNumber: string; cardPrice: number; cardEditorVersion?:number; designReviewVersion?:number; offerPrices?: {direct_link:number;profile:number}; checkoutVersion?:number; pricingCatalogVersion?:number; offerPricingVersion?:number; emailNotificationsEnabled: boolean; version: number };
export type WizardDraft = {
  pricingVersion?:3|4; pricingCatalogVersion?:number; pricingSnapshot?:PricingCatalog; offer?:'two_card_bundle'|'three_card_bundle'; existingProfileId?:string;
  product?: 'direct_link' | 'profile'; directLink?: string;
  cardTemplate: CardTemplateId; quantity: number; size: string;
  physical: PhysicalCard; backDesignPreview?: string; logoPreview?:string; logoUploadPending?:boolean;
  customDesignUrl?: string; customDesignPreview?: string; avatarUrl?: string; avatarPreview?: string;
  avatarUploadPending: boolean; displayName: string; title: string; bio: string; location?:string; handleEdited?:boolean; usernameSuggested: string;
  links: ProfileLink[]; customer: CustomerInfo; deliveryMethod: DeliveryMethod; payment: PaymentInfo; customerNotes: string;
};
export function blankApplication(email: string): WizardDraft {
  return { pricingVersion:4, product:'profile', directLink:'', physical:blankPhysicalCard(),customerNotes:'', cardTemplate:'simple', quantity:1, size:STANDARD_CARD_SIZE, avatarUploadPending:false, displayName:'', title:'', bio:'', location:'', handleEdited:false, usernameSuggested:'', links:[], customer:{fullName:'',phone:'',email,address:'',city:''},deliveryMethod:'delivery',payment:{method:'bank',status:'pending'} };
}
export function applicationPayload(d: WizardDraft): ApplicationPayload {
  const words=printedWords(d.physical,d.displayName||d.customer.fullName,d.title);
  return {...(d.pricingVersion?{pricingVersion:d.pricingVersion}:{}),...(d.pricingCatalogVersion?{pricingCatalogVersion:d.pricingCatalogVersion}:{}),...(d.offer?{offer:d.offer}:{}),...(d.existingProfileId?{existingProfileId:d.existingProfileId}:{}),...(d.product?{product:d.product}:{}),...(d.product==='direct_link'?{directLink:normaliseDirectLink(d.directLink||'')}:{}),customerNotes:d.customerNotes,card:{template:d.cardTemplate,quantity:d.quantity,size:d.size,physical:{...d.physical,...(words.name?{printedName:words.name}:{}),printedTitle:words.title},...(d.cardTemplate==='upload' && d.customDesignUrl && d.customDesignUrl !== 'pending' ? {customDesignUrl:d.customDesignUrl}: {})},customer:{...d.customer,fullName:d.customer.fullName,...(d.deliveryMethod==='nastp_pickup'?{address:'',city:'',postalCode:''}:{})},profileDraft:d.product==='direct_link'?{displayName:d.customer.fullName||d.displayName,title:'',bio:'',usernameSuggested:'direct-card',links:[]}:{displayName:d.displayName,title:d.title,bio:d.bio,location:d.location||'',handleEdited:!!d.handleEdited,usernameSuggested:d.usernameSuggested||suggestProfileHandle(d.displayName),links:d.links,...(d.avatarUrl?{avatarUrl:d.avatarUrl}:{})},deliveryMethod:d.deliveryMethod,payment:{method:d.payment.method as CheckoutMethod,...(d.payment.receiptUrl?{receiptUrl:d.payment.receiptUrl}:{}),...(d.payment.reference?{reference:d.payment.reference}:{})}};
}
export function suggestProfileHandle(name: string): string {
  if (!name.trim()) return '';
  return name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0,30).replace(/-+$/g, '') || 'profile';
}
export function contactEmail(links: ProfileLink[]): string {
  for (const link of links) {
    const address = /^mailto:([^?\s]+)$/i.exec(link.url)?.[1];
    if (address && address.length <= 254 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(address)) return address.toLowerCase();
  }
  return '';
}
export function wizardFromApplication(p: ApplicationPayload): WizardDraft {
  return {...blankApplication(p.customer.email),pricingVersion:p.pricingVersion,pricingCatalogVersion:p.pricingCatalogVersion,offer:p.offer==='two_card_bundle'||p.offer==='three_card_bundle'?p.offer:undefined,existingProfileId:p.existingProfileId,product:p.product,directLink:p.directLink,physical:p.card.physical||blankPhysicalCard(p.card.template),cardTemplate:p.card.template,quantity:p.card.quantity,size:STANDARD_CARD_SIZE,customDesignUrl:p.card.customDesignUrl,...p.profileDraft,...(p.product==='direct_link'?{displayName:p.card.physical?.printedName||'',title:p.card.physical?.printedTitle||''}:{}),avatarUrl:p.profileDraft.avatarUrl,customer:{...p.customer,fullName:p.customer.fullName},customerNotes:p.customerNotes||'',deliveryMethod:p.deliveryMethod,payment:{...p.payment,status:'pending'}};
}
async function rpc<T>(name:string,args:Record<string,unknown>={}):Promise<T>{
  const {data,error}=await getSupabase().rpc(name,args); if(error) throw Object.assign(new Error(error.message),{code:error.code}); return data as T;
}
export function isOrderingUnavailable(error: unknown): boolean {
  return ['PGRST202','PGRST205','42883','42P01'].includes((error as {code?:string})?.code || '');
}
export const attachExistingOrderProfile=(order:Order)=>rpc<void>('attach_existing_order_profile',{p_id:order.id,p_version:order.version});
export const confirmLinkDestination=(order:Order)=>rpc<void>('confirm_link_destination',{p_id:order.id,p_version:order.version});
export function supportsCardEditor(settings:OrderSettings|null,draft:WizardDraft):boolean {return (!(draft.physical.logoUrl||draft.logoPreview||draft.physical.templateVersion>=2)||(settings?.cardEditorVersion||0)>=4)&&(!draft.physical.editor||(settings?.cardEditorVersion||0)>=3);}
export function supportsProofReview(settings:OrderSettings|null,draft:WizardDraft):boolean{return !draft.product||(settings?.designReviewVersion||0)>=1;}
export async function deliverOrderNotifications(order:Order,proof=false):Promise<void>{const {data,error}=await getSupabase().functions.invoke('order-notifications',{body:{orderId:order.id,...(proof?{proof:true,version:order.version}:{})}});if(error||data?.error)throw new Error(data?.error||'Email could not be sent. Check notification service configuration; no timer starts before sending.');}
export const shareDesignProof=(o:Order)=>rpc<void>('share_design_proof',{p_id:o.id,p_version:o.version});
export const respondToDesignProof=(o:Order,action:'confirm'|'request_changes',note:string)=>rpc<void>('respond_to_design_proof',{p_id:o.id,p_revision:o.printRevision,p_action:action,p_note:note,p_version:o.version});
export const recordDesignEditPayment=(o:Order,amount:number,note:string)=>rpc<void>('record_design_edit_payment',{p_id:o.id,p_amount_minor:Math.round(amount*100),p_note:note,p_version:o.version});
export const getOrderSettings=()=>rpc<OrderSettings>('get_order_settings');
export const saveOrderSettings=(settings:OrderSettings)=>rpc<void>('save_order_settings',{p_settings:settings,p_version:settings.version});
export const getMyApplications=()=>rpc<ApplicationDraft[]>('get_my_applications');
export const getMyOrders=()=>rpc<Order[]>('get_my_orders');
export const saveApplicationDraft=(id:string,payload:ApplicationPayload,step:number,version:number)=>rpc<{id:string;version:number;state:string}>('save_application_draft',{p_id:id,p_payload:payload,p_step:step,p_version:version});
export const submitApplication=(id:string,version:number)=>rpc<string>('submit_application',{p_id:id,p_version:version});
export const reviewApplication=(order:Order,action:string,message:string)=>rpc<void>('review_application',{p_id:order.id,p_action:action,p_message:message,p_version:order.version});
export const rejectPayment=(order:Order,reason:string)=>rpc<void>('reject_payment',{p_id:order.id,p_reason:reason,p_version:order.version});
export const confirmCardSpec=(order:Order,size:string,template:string)=>rpc<void>('confirm_card_spec',{p_id:order.id,p_size:size,p_template:template,p_version:order.version});
export const confirmDeliveryPayment=(order:Order,reference:string)=>rpc<void>('confirm_delivery_payment',{p_id:order.id,p_reference:reference,p_version:order.version});
export const queueDesignProofEmail=(o:Order)=>rpc<void>('queue_design_proof_email',{p_id:o.id,p_version:o.version});
export const recordDesignReply=(o:Order,action:string,note:string,receivedAt:string)=>rpc<void>('record_design_reply',{p_id:o.id,p_action:action,p_note:note,p_received_at:new Date(receivedAt).toISOString(),p_version:o.version});
export const confirmDesignNoReply=(o:Order)=>rpc<void>('confirm_design_no_reply',{p_id:o.id,p_version:o.version});
export const prepareOrderArtwork=(order:Order,path:string)=>rpc<void>('prepare_order_artwork',{p_id:order.id,p_path:path,p_version:order.version});
export const preparePrintProof=(order:Order,physical:PhysicalCard,settings:PrintSettings,files:{front:string;back:string;pdf:string})=>rpc<PrintSnapshot>('prepare_print_proof',{p_id:order.id,p_physical:physical,p_settings:settings,p_front:files.front,p_back:files.back,p_pdf:files.pdf,p_version:order.version});
export const getPrintPackage=(order:Order)=>rpc<PrintSnapshot>('get_print_package',{p_id:order.id,p_version:order.version});
export const dispatchRider=(order:Order,fee:number,message:string)=>{const minor=Math.round(fee*100);if(!Number.isFinite(fee)||!Number.isSafeInteger(minor)||Math.abs(fee*100-minor)>0.000001)throw new Error('Enter the actual rider fare in rupees, with at most two decimal places.');return rpc<void>('dispatch_rider',{p_id:order.id,p_fee_minor:minor,p_message:message,p_version:order.version});};
export const addCustomerMessage=(order:Order,message:string)=>rpc<void>('add_customer_message',{p_id:order.id,p_message:message,p_version:order.version});
export const addOrderNote=(order:Order,note:string)=>rpc<void>('add_order_note',{p_id:order.id,p_note:note});

export const REVIEW_LABELS:Record<string,string>={submitted:'Submitted',under_review:'Under Review',changes_required:'Changes Required',accepted:'Accepted',rejected:'Rejected',cancelled:'Cancelled'};
export const FULFILLMENT_LABELS:Record<string,string>={new:'Awaiting review',paid:'Card Payment Verified',profile_created:'Card destination ready',production_ready:'Awaiting Production',printing:'In Production',ready_for_nfc:'Printing finished; awaiting NFC',nfc_programmed:'NFC Programmed',qa_passed:'Quality checks passed',ready_to_ship:'Ready for Dispatch',shipped:'Dispatched',delivered:'Delivered',ready_for_pickup:'Ready for NASTP Pickup',picked_up:'Picked Up',completed:'Completed',cancelled:'Cancelled'};
export function nextOrderAction(o:Order):string{
  if(o.applicationStatus==='changes_required')return 'Read the EdgeTap message, update your saved application and resubmit it.';
  if(o.applicationStatus==='rejected'||o.applicationStatus==='cancelled')return 'This application is closed. Contact EdgeTap about any payment or remedy questions.';
  if(o.applicationStatus!=='accepted'&&!o.profileId&&!o.nfcUrl)return "We're reviewing your request. Any updates will appear here.";
  if(o.fulfillment.status==='ready_for_pickup')return o.fulfillmentInstructions||'Your card is ready at NASTP Delta 3. Pickup Monday–Friday, 9 am–5 pm. Contact +92 304 414 9674 after reaching NASTP.';
  if(o.fulfillment.status==='shipped'&&o.deliveryIncluded)return 'Your rider is on the way. Follow the delivery updates here.';
  if(o.fulfillment.status==='shipped')return o.deliveryPaymentRecipient==='rider_direct'?'Your rider is on the way. Pay the recorded delivery fare directly to the rider; it is separate from your card payment.':'Your card has been marked dispatched. EdgeTap will confirm delivery details.';
  if(['completed','delivered','picked_up'].includes(o.fulfillment.status))return 'Your card has been marked received. Contact EdgeTap if you need help.';
  if(o.designProofStatus==='changes_requested')return 'EdgeTap is revising your card from your change note. Printing is on hold.';
  if(o.designReviewChannel==='account'&&o.designProofStatus==='awaiting_response')return 'Your card proof is ready in My orders. Check both sides, then approve it or submit your changes in one note. Printing waits for your decision.';
 if(o.designProofStatus==='awaiting_email')return 'Your final design is prepared, but its email has not been sent yet. The 10-hour reply window has not started. Printing is on hold.';
 if(o.designProofStatus==='awaiting_response')return 'Reply to the final-design email within 10 hours to confirm or request changes. The actual deadline appears below. Printing is on hold until review is complete.';
 if(o.physicalFormat==='profile_only'&&o.profileId)return 'Your digital profile is live and ready to share.';
 if(o.physicalFormat==='nfc_tag')return 'Follow your NFC tag preparation and collection updates here. A printed card proof is not needed.';
 return o.profileId?'Your digital profile is live. Follow physical card updates here.':'EdgeTap will update your order here.';
}
export function nextFulfillment(o:Order):string|undefined{
  if(o.applicationStatus!=='accepted'&&!o.profileId&&!o.nfcUrl)return;
  const next:Record<string,string>={profile_created:'production_ready',production_ready:'printing',printing:'ready_for_nfc',ready_for_nfc:'nfc_programmed',nfc_programmed:'qa_passed',qa_passed:o.deliveryMethod==='nastp_pickup'?'ready_for_pickup':'ready_to_ship',ready_for_pickup:'picked_up',ready_to_ship:'shipped',shipped:'delivered',delivered:'completed',picked_up:'completed'};
  return next[o.fulfillment.status];
}

export const adminManageOrder=(order:Order,action:string,value:Record<string,unknown>={})=>rpc<{saved:boolean;version:number}>('admin_manage_order',{p_id:order.id,p_version:order.version,p_action:action,p_value:value});
