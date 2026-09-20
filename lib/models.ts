// Cross-cutting domain models that live outside the marketing data files.
// Order + fulfillment + card data live in lib/data/order.ts.

// A public review left for a profile (customer → review request).
export type Review = {
  id?: string;
  profileId?: string; // stable profile ID if known
  username: string;
  rating: number; // 1..5
  text: string;
  authorName: string;
  authorUid?: string; // auth UID when the reviewer is signed in
  createdAt: number;
};

// Stable internal profile → public handle mapping.
// The username is a mutable public handle; the profileId never changes,
// so links, NFC/QR destinations and review associations keep working
// even if the handle is renamed.
export type ClientProfileMeta = {
  profileId: string;
  username: string;
  ownerUid?: string;
  active: boolean;
  createdAt: number;
};

// Admin authorization: an admin is any auth UID listed in config/admin_uids.
// The rules check membership via get() — the doc itself is never public-readable.
export type AdminConfig = {
  uids: string[];
};