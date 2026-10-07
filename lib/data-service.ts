import { usesSupabase } from './backend';
import { getSupabase } from './supabase';
import type { Profile } from './data/profile';
import type { Order, FulfillmentStatus, CustomerInfo } from './data/order';
import type { Review } from './models';

async function rpc<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await getSupabase().rpc(name, args);
  if (error) throw new Error(error.message);
  return data as T;
}
const firebase = () => import('./firestore');
export async function getProfile(username = 'ibraheem'): Promise<Profile> {
  if (!usesSupabase) return (await firebase()).getProfile(username);
  const profile = await rpc<Profile | null>('get_public_profile', { p_username: username });
  if (!profile) throw new Error('Profile not found.');
  return profile;
}
export async function getStaffProfile(username: string): Promise<Profile | null> {
  if (usesSupabase) return rpc('get_staff_profile', { p_username: username });
  const [sdk, app] = await Promise.all([import('firebase/firestore'), import('./firebase')]);
  const snap = await sdk.getDoc(sdk.doc(app.db, 'profiles', username));
  return snap.exists() ? snap.data() as Profile : null;
}
export async function canEditProfile(profile: Profile): Promise<boolean> {
  if (usesSupabase) return !!profile.profileId && rpc<boolean>('can_edit_profile', { p_id: profile.profileId });
  const { getCurrentUser } = await import('./auth');
  return (await getCurrentUser())?.uid === profile.ownerUid && !!profile.ownerUid;
}
export async function saveFounderProfile(profile: Profile): Promise<void> {
  if (usesSupabase) return rpc('save_founder_profile', { p_profile: profile });
  const [sdk, app] = await Promise.all([import('firebase/firestore'), import('./firebase')]);
  await sdk.setDoc(sdk.doc(app.db, 'profiles', 'ibraheem'), profile, { merge: true });
}
export async function saveProfile(username: string, profile: Profile): Promise<void> {
  if (!usesSupabase) return (await firebase()).saveProfile(username, profile);
  return rpc('update_profile', { p_username: username, p_profile: profile });
}
export function orderNumber(from = new Date()): string {
  const date = `${from.getFullYear()}${String(from.getMonth()+1).padStart(2,'0')}${String(from.getDate()).padStart(2,'0')}`;
  return `ET-${date}-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
}
export async function createOrder(order: Order, requestKey = crypto.randomUUID()): Promise<string> {
  if (!usesSupabase) return (await firebase()).createOrder(order);
  const id = await rpc<string>('create_order', { p_order: order, p_request_key: requestKey });
  // The confirmation must show the persisted server number, not a local preview.
  const receipt = await rpc<{ orderNumber: string }>('get_order_receipt', { p_id: id });
  order.orderNumber = receipt.orderNumber;
  return id;
}
export type SubmissionReceipt = { id: string; orderNumber: string; paymentStatus: string; fulfillmentStatus: string };
export async function findOrderSubmission(requestKey: string): Promise<SubmissionReceipt | null> {
  if (!usesSupabase) throw new Error('Order recovery requires Supabase.');
  return rpc('find_order_submission', { p_request_key: requestKey });
}
export async function getOrders(): Promise<Order[]> {
  return usesSupabase ? rpc('list_orders') : (await firebase()).getOrders();
}
export async function getOrder(id: string): Promise<Order> {
  if (!usesSupabase) return (await firebase()).getOrder(id);
  const order = await rpc<Order | null>('get_order', { p_id: id });
  if (!order) throw new Error('Order not found.');
  return order;
}
export async function adminUpdateOrder(id: string, patch: Partial<Order>): Promise<void> {
  if (!usesSupabase) return (await firebase()).adminUpdateOrder(id, patch);
  if (Object.keys(patch).some(k => !['deliveryFee','version'].includes(k)) || patch.deliveryFee == null || patch.version == null || !Number.isSafeInteger(patch.deliveryFee*100)) throw new Error('Use the dedicated order actions. A quote requires its current version.');
  return rpc('update_order_quote', { p_id: id, p_delivery_fee_minor: patch.deliveryFee*100, p_version: patch.version });
}
export async function confirmPayment(order: Order): Promise<void> {
  if (!usesSupabase) return (await firebase()).confirmPayment(order);
  if (!order.id) throw new Error('Order ID required.');
  return rpc('confirm_payment', { p_id: order.id });
}
export async function advanceFulfillment(id: string, expect: FulfillmentStatus, to: FulfillmentStatus): Promise<void> {
  return usesSupabase ? rpc('advance_fulfillment', { p_id: id, p_expect: expect, p_to: to }) : (await firebase()).advanceFulfillment(id, expect, to);
}
export async function createReview(review: Review): Promise<void> {
  return usesSupabase ? rpc('create_review', { p_review: review }) : (await firebase()).createReview(review);
}
export async function listReviews(max = 20): Promise<Review[]> {
  return usesSupabase ? rpc('list_reviews', { p_limit: max }) : (await firebase()).listReviews(max);
}
export async function usernameAvailable(username: string): Promise<boolean> {
  const clean = username.toLowerCase().replace(/[^a-z0-9._-]/g,'').slice(0,30);
  if (!clean || clean === '.' || clean === '..') return false;
  return usesSupabase ? rpc('username_available', { p_username: clean }) : (await firebase()).usernameAvailable(clean);
}
export async function suggestUsername(firstName?: string, lastName?: string): Promise<string> {
  const base = ((firstName||'')+(lastName||'')).toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,24)||'profile';
  for(let i=1;i<100;i++) { const candidate=i===1 ? base : `${base}${i}`; if(await usernameAvailable(candidate)) return candidate; }
  throw new Error('Choose another profile handle.');
}
export async function createClientProfileFromOrder(order: Order, username: string): Promise<{ profileId: string; profileUrl: string }> {
  if (!usesSupabase) return (await firebase()).createClientProfileFromOrder(order, username);
  if (!order.id || !order.version) throw new Error('Refresh the order before publishing.');
  return rpc('publish_order_profile', { p_id: order.id, p_username: username.toLowerCase().replace(/[^a-z0-9._-]/g,'').slice(0,30), p_version: order.version });
}
export type { CustomerInfo };
