import { extraLinkCost } from '../checkout';
// Order / fulfillment domain data, kept separate from presentation.
// Shared by the /order wizard, the admin dashboard, and lib/firestore.ts.

import type { ProfileLink } from "./profile";
import templates from './card-templates.json';
import type { PhysicalCard, PrintSnapshot } from '../physical-card';

// Owner-confirmed standard size; other size/design availability needs review.
export const STANDARD_CARD_SIZE = 'Standard — 85.60 × 53.98 mm';

// ── Card templates ────────────────────────────────────────────────
export type CardTemplateId = string;

export type CardTemplate = {
  id: CardTemplateId;
  preview?: string;
  name: string;
  tagline: string;
  tone: string; // tailwind bg tone for the visual preview
  description: string;
};

const previewNames: Record<string, string> = { custom:'maincard', simple:'photography', lux:'studio', wood:'botanical', inverted:'honeycomb' };
export const CARD_TEMPLATES: CardTemplate[] = ['custom','simple','lux','wood','inverted'].map<CardTemplate>(id => {
  const t = templates.filter(t => t.id === id).sort((a,b) => b.version-a.version)[0];
  return { id:t.id, name:t.name, tagline:t.tagline, tone:t.tone, description:t.description, preview:'/card-previews/'+previewNames[id]+'-v'+(id==='custom'?2:1)+'.webp' };
}).concat([{id:'upload',name:'Upload a design',tagline:'Your front & back',tone:'bg-[--sky-soft]',description:'Upload separate front and back artwork for review.',preview:undefined}]);

// The plan (from /pricing) that seeded an order.
export type OrderPlanId = "standard" | "direct_link" | "profile" | "business" | "enterprise";

// ── Customer / delivery (PRIVATE — never surfaced on /u/…) ───────
export type CustomerInfo = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  postalCode?: string;
};

export type DeliveryMethod = "pickup" | "delivery" | "nastp_pickup";

// ── Card selection on an order ────────────────────────────────────
export type OrderCard = {
  template: CardTemplateId;
  quantity: number;
  size?: string;
  customDesignUrl?: string; // Original customer artwork, private and preserved
  physical?: PhysicalCard;
};

// What the customer built during onboarding (draft of the future profile).
export type ProfileDraft = {
  location?: string;
  avatarUrl?: string; // Storage ref — "https://" placeholders are treated as empty
  displayName: string;
  title?: string;
  bio?: string;
  usernameSuggested?: string;
  links: ProfileLink[];
};

// ── Payment (state kept separate from order/fulfillment) ──────────
export type PaymentMethod = "bank" | "easypaisa" | "jazzcash";
export type PaymentStatus =
  | "pending" // online chosen but no provider integrated yet
  | "paid"
  | "failed"
  | "cod_pending_confirmation"
  | "refunded"
  | "cancelled";

export type PaymentInfo = {
  method: "bank" | "easypaisa" | "jazzcash";
  status: PaymentStatus;
  receiptUrl?: string;
  reference?: string;
  providerRef?: string; // future provider reference (provider not integrated yet)
};

// ── Fulfillment state machine ─────────────────────────────────────
export const FULFILLMENT_FLOW = [
  "new",
  "payment_pending",
  "paid", // online paid
  "cod_pending_confirmation", // COD chosen — awaiting confirmation before production
  "profile_created",
  "production_ready",
  "printing",
  "ready_for_nfc",
  "nfc_programmed",
  "qa_passed",
  "ready_to_ship",
  "shipped",
  "delivered",
  "ready_for_pickup",
  "picked_up",
  "completed",
] as const;

export type FulfillmentStatus = (typeof FULFILLMENT_FLOW)[number] | "cancelled";

export type FulfillmentEvent = {
  status: FulfillmentStatus;
  at: number; // epoch ms
};

export type FulfillmentInfo = {
  status: FulfillmentStatus;
  history: FulfillmentEvent[];
};

// Explicit steps prevent marking an unproduced card shipped or skipping QA.
const NEXT: Partial<Record<FulfillmentStatus, FulfillmentStatus[]>> = {
  new: ["payment_pending", "paid"], payment_pending: ["paid"],
  paid: ["profile_created"], profile_created: ["production_ready"],
  production_ready: ["printing"], printing: ["ready_for_nfc"],
  ready_for_nfc: ["nfc_programmed"], nfc_programmed: ["qa_passed"],
  qa_passed: ["ready_to_ship"], ready_to_ship: ["shipped"], shipped: ["delivered"],
  ready_for_pickup: ["picked_up"], picked_up: ["completed"], delivered: ["completed"],
};
export function canTransition(from: FulfillmentStatus, to: FulfillmentStatus): boolean {
  if (to === "cancelled") return from !== "cancelled" && from !== "delivered";
  return NEXT[from]?.includes(to) || false;
}

export type FulfillmentState = {
  status: FulfillmentStatus;
  label: string;
};

// Only statuses the backend can actually report are rendered on the
// customer confirmation tracker (spec: don't show states that don't exist).
export const FULFILLMENT_STATES: FulfillmentState[] = FULFILLMENT_FLOW.map((s) => ({
  status: s,
  label: s.replace(/_/g, " "),
}));

// ── Order ─────────────────────────────────────────────────────────
export type Order = {
  applicationStatus?: "submitted" | "under_review" | "changes_required" | "accepted" | "rejected" | "cancelled";
  applicationId?: string;
  approvedCardSize?: string;
  approvedCardTemplate?: CardTemplateId;
  customerNotes?: string;
  cardVerifiedAmount?: number;
  designProofScope?: 'pending' | 'all_personalized' | 'uploaded_only';
  designProofStatus?: 'not_required'|'preparing'|'awaiting_email'|'awaiting_response'|'changes_requested'|'approved'|'approved_no_response';
  designRevisionPolicy?:'legacy'|'one_included';
  includedDesignEditUsed?:boolean;
  paidDesignEditCredits?:number;
  designReviewChannel?:'email'|'account';
  designSharedRevision?:number;
  designSharedAt?:number;
  designProofSentAt?: number;
  designProofDeadlineAt?: number;
  deliveryPaymentRecipient?: 'edgetap' | 'rider_direct';
  fixedCardFormat?: boolean;
  riderFee?: number | null;
  fulfillmentInstructions?: string;
  preparedArtworkUrl?: string;
  artworkPreparedAt?: number;
  printSnapshot?: PrintSnapshot;
  printRevision?: number;
  deliveryPaymentStatus?: "pending" | "verified" | "not_required";
  deliveryPaymentReference?: string;
  deliveryVerifiedAmount?: number;
  events?: { id: string; kind: string; message: string; at: number }[];
  internalNotes?: { id: string; note: string; at: number }[];
  id?: string; // Preserved source document ID or database order ID
  version?: number; // Supabase transaction conflict check
  ownerUid?: string; // Backend auth identifier for the customer account
  orderNumber: string;
  plan: OrderPlanId;
  directLink?: string;
  card: OrderCard;
  deliveryMethod: DeliveryMethod;
  subtotal: number;
  deliveryFee: number | null;
  total: number | null;
  profileDraft: ProfileDraft;
  customer: CustomerInfo; // PRIVATE
  payment: PaymentInfo;
  fulfillment: FulfillmentInfo;
  profileId?: string; // set when admin creates the client profile
  usernameFinal?: string; // chosen handle on /u/
  nfcUrl?: string; // Stored confirmed URL: preserve historical hosts and approved print snapshots.
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
};

export const LINK_PRESETS: { type: string; label: string }[] = [
  { type: "email", label: "Email" },
  { type: "whatsapp", label: "WhatsApp" },
  { type: "instagram", label: "Instagram" },
  { type: "linkedin", label: "LinkedIn" },
  { type: "portfolio", label: "Website" },
  { type: "portfolio", label: "Portfolio" },
  { type: "telegram", label: "Telegram" },
  { type: "facebook", label: "Facebook" },
  { type: "tiktok", label: "TikTok" },
  { type: "youtube", label: "YouTube" },
  { type: "github", label: "GitHub" },
];

// Default accents for the common link types (matches ProfilePage icons).
export const LINK_ACCENTS: Record<string, string> = {
  email: "#FF6B5B",
  whatsapp: "#25D366",
  linkedin: "#0A66C2",
  instagram: "#E1306C",
  portfolio: "#7FA8FF",
  github: "#100B4A",
  mail: "#FF6B5B",
  phone: "#25D366",
  telegram: "#229ED9",
  facebook: "#1877F2",
  tiktok: "#100B4A",
  youtube: "#FF0000",
  globe: "#7FA8FF",
};

export type CardProduct = 'direct_link' | 'profile';
export const CARD_PRICES = {direct_link:999,profile:1499,standard:999} as const;
export const CARD_PRICE = CARD_PRICES.profile;
export const cardPrice = (product: CardProduct | 'standard' = 'profile') => CARD_PRICES[product];

export function calculateSubtotal(quantity: number, product: CardProduct | 'standard' = 'profile', linkCount = 0): number {
  return cardPrice(product) * Math.max(1, Math.min(20, Math.floor(quantity))) + (product === 'direct_link' ? 0 : extraLinkCost(linkCount));
}
