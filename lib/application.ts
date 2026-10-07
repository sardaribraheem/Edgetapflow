import { STANDARD_CARD_SIZE } from './data/order';
import { getSupabase } from './supabase';
import type { Order, CardTemplateId, CustomerInfo, DeliveryMethod, PaymentInfo } from './data/order';
import type { ProfileLink } from './data/profile';

export type ApplicationPayload = {
  customerNotes?: string;
  card: { template: CardTemplateId; quantity: number; size: string; customDesignUrl?: string };
  customer: CustomerInfo;
  profileDraft: { displayName: string; title: string; bio: string; usernameSuggested: string; avatarUrl?: string; links: ProfileLink[] };
  deliveryMethod: DeliveryMethod;
  payment: { method: 'jazzcash'; receiptUrl?: string; reference?: string };
};
export type ApplicationDraft = { id: string; orderId?: string; payload: ApplicationPayload; step: number; version: number; state: 'draft' | 'changes_required'; updatedAt: number };
export type OrderSettings = { pickupDetails: string; deliveryDetails: string; hostingDetails: string; cardSizes: string[]; cardDimensions: string; jazzcashNumber: string; cardPrice: number; emailNotificationsEnabled: boolean; version: number };
export type WizardDraft = {
  cardTemplate: CardTemplateId; quantity: number; size: string;
  customDesignUrl?: string; customDesignPreview?: string; avatarUrl?: string; avatarPreview?: string;
  avatarUploadPending: boolean; displayName: string; title: string; bio: string; usernameSuggested: string;
  links: ProfileLink[]; customer: CustomerInfo; deliveryMethod: DeliveryMethod; payment: PaymentInfo; customerNotes: string;
};
export function blankApplication(email: string): WizardDraft {
  return { customerNotes:'', cardTemplate:'simple', quantity:1, size:STANDARD_CARD_SIZE, avatarUploadPending:false, displayName:'', title:'', bio:'', usernameSuggested:'', links:[], customer:{fullName:'',phone:'',email,address:'',city:''},deliveryMethod:'delivery',payment:{method:'jazzcash',status:'pending'} };
}
export function applicationPayload(d: WizardDraft): ApplicationPayload {
  return {customerNotes:d.customerNotes,card:{template:d.cardTemplate,quantity:d.quantity,size:d.size,...(d.customDesignUrl && d.customDesignUrl !== 'pending' ? {customDesignUrl:d.customDesignUrl}: {})},customer:{...d.customer,...(d.deliveryMethod==='nastp_pickup'?{address:'',city:'',postalCode:''}:{})},profileDraft:{displayName:d.displayName,title:d.title,bio:d.bio,usernameSuggested:d.usernameSuggested,links:d.links,...(d.avatarUrl?{avatarUrl:d.avatarUrl}:{})},deliveryMethod:d.deliveryMethod,payment:{method:'jazzcash',...(d.payment.receiptUrl?{receiptUrl:d.payment.receiptUrl}:{}),reference:d.payment.reference||''}};
}
export function wizardFromApplication(p: ApplicationPayload): WizardDraft {
  return {...blankApplication(p.customer.email),cardTemplate:p.card.template,quantity:p.card.quantity,size:p.card.size,customDesignUrl:p.card.customDesignUrl,...p.profileDraft,avatarUrl:p.profileDraft.avatarUrl,customer:p.customer,customerNotes:p.customerNotes||'',deliveryMethod:p.deliveryMethod,payment:{...p.payment,status:'pending'}};
}
async function rpc<T>(name:string,args:Record<string,unknown>={}):Promise<T>{
  const {data,error}=await getSupabase().rpc(name,args); if(error) throw new Error(error.message); return data as T;
}
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
export const addCustomerMessage=(order:Order,message:string)=>rpc<void>('add_customer_message',{p_id:order.id,p_message:message,p_version:order.version});
export const addOrderNote=(order:Order,note:string)=>rpc<void>('add_order_note',{p_id:order.id,p_note:note});

export const REVIEW_LABELS:Record<string,string>={submitted:'Submitted',under_review:'Under Review',changes_required:'Changes Required',accepted:'Accepted',rejected:'Rejected',cancelled:'Cancelled'};
export const FULFILLMENT_LABELS:Record<string,string>={new:'Awaiting review',paid:'Card Payment Verified',profile_created:'Profile published',production_ready:'Awaiting Production',printing:'In Production',ready_for_nfc:'Printing finished; awaiting NFC',nfc_programmed:'NFC Programmed',qa_passed:'Quality checks passed',ready_to_ship:'Ready for Dispatch',shipped:'Dispatched',delivered:'Delivered',ready_for_pickup:'Ready for NASTP Pickup',picked_up:'Picked Up',completed:'Completed',cancelled:'Cancelled'};
export function nextOrderAction(o:Order):string{
  if(o.applicationStatus==='changes_required')return 'Read the EdgeTap message, update your saved application and resubmit it.';
  if(o.applicationStatus==='rejected'||o.applicationStatus==='cancelled')return 'This application is closed. Contact EdgeTap about any payment or remedy questions.';
  if(o.applicationStatus!=='accepted')return 'EdgeTap is reviewing your information, requested card specification and manual JazzCash card payment. Delivery fees are confirmed separately afterward.';
  if(o.fulfillment.status==='ready_for_pickup')return 'Contact EdgeTap to confirm the NASTP collection point and time before collecting your card.';
  if(o.fulfillment.status==='shipped')return 'Your card has been marked dispatched. EdgeTap will confirm delivery details.';
  if(['completed','delivered','picked_up'].includes(o.fulfillment.status))return 'Your card has been marked received. Contact EdgeTap if you need help.';
  return 'Your order is accepted. EdgeTap will update the production, NFC programming and quality-check stages here.';
}
export function nextFulfillment(o:Order):string|undefined{
  if(o.applicationStatus!=='accepted')return;
  const next:Record<string,string>={profile_created:'production_ready',production_ready:'printing',printing:'ready_for_nfc',ready_for_nfc:'nfc_programmed',nfc_programmed:'qa_passed',qa_passed:o.deliveryMethod==='nastp_pickup'?'ready_for_pickup':'ready_to_ship',ready_for_pickup:'picked_up',ready_to_ship:'shipped',shipped:'delivered',delivered:'completed',picked_up:'completed'};
  return next[o.fulfillment.status];
}
