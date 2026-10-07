// Site-wide content, kept separate from presentation.

export const nav = {
  brand: "EDGE TAP",
  links: [
    { label: "What We Offer", href: "/#offer" },
    { label: "Solutions", href: "/#solutions" },
    { label: "How It Works", href: "/#solutions" },
    { label: "Pricing", href: "/pricing" },
    { label: "Example Profile", href: "/u/ibraheem" },
  ],
  cta: { label: "Get Started", href: "/order" },
};

// SECTION 02 — "What can we build for you?"
export type Solution = {
  index: string;
  tag: string;
  title: string;
  description: string;
  bullets: string[];
  icon: string; // maps to a doodle component
  tone: "yellow" | "coral" | "sky" | "mint" | "ink";
  custom?: boolean; // the 06 tile is a big editorial moment
};

export const solutions: Solution[] = [
  { index: "01", tag: "Your card", title: "Physical NFC Business Card",
    description: "Carry one card that opens your EdgeTap profile on compatible NFC smartphones.",
    bullets: ["Rs. 999 per card", "Choose a card design", "No visitor app"], icon: "businessCard", tone: "yellow" },
  { index: "02", tag: "Your profile", title: "Your Contact Details & Links",
    description: "Share up to ten contact and social links on your digital profile. Sign in to update it after activation.",
    bullets: ["WhatsApp", "Portfolio", "Save contact"], icon: "globe", tone: "mint" },
  { index: "03", tag: "QR fallback", title: "Scan to Connect",
    description: "No NFC? Scan the QR code on the card with a phone camera. It opens the same profile in a browser; internet access is required.",
    bullets: ["Same profile", "Camera scan", "NFC optional"], icon: "businessCard", tone: "sky" },
];

// SECTION 03 — use-case storytelling
export type UseCase = {
  id: string;
  kicker: string;
  headline: string;
  context: string;
  icon: string;
  tone: "yellow" | "coral" | "sky";
  phone: "profile" | "menu" | "review";
};

export const useCases: UseCase[] = [
  { id: "meet", kicker: "How it works · 1", headline: "Make an introduction.",
    context: "At a meeting or event, hold your card near the NFC reader on a compatible phone. Open the notification to visit your profile.",
    icon: "card", tone: "yellow", phone: "profile" },
  { id: "scan", kicker: "How it works · 2", headline: "Or scan the QR code.",
    context: "Use the phone camera to scan the card’s QR code when NFC is unavailable. Both routes open the same profile in the browser.",
    icon: "card", tone: "coral", phone: "profile" },
  { id: "connect", kicker: "How it works · 3", headline: "Stay connected.",
    context: "Visitors choose a contact link or download your contact card. You can update your profile after activation without replacing the physical card.",
    icon: "card", tone: "sky", phone: "profile" },
];

// FAQ
export const faqs = [
  { q: "What do I receive for Rs. 999?", a: "One physical NFC card with a QR fallback, linked to your EdgeTap digital profile with up to ten contact links. Delivery is quoted separately for your location before fulfillment." },
  { q: "How does the NFC card work?", a: "Hold your card near the NFC reader on a compatible phone and open the notification. Your profile opens in the browser. Reader position and NFC settings vary by phone; internet access is required." },
  { q: "What if a phone does not support NFC?", a: "Scan the QR code on the card with the phone camera. It links to the same digital profile, so NFC is optional." },
  { q: "Can I change my information later?", a: "Sign in with your checkout account and open your activated profile to update your details and links. Your physical card keeps the same profile URL." },
  { q: "How do I order and pay?", a: "Prepare your card and profile details, then contact EdgeTap on WhatsApp to arrange your order. Confirm delivery coverage, fee, dispatch estimate, hosting terms, complete cost and the JazzCash recipient before transferring funds. Payment is reviewed manually before production; preparing selections on the website does not confirm an order." },
  { q: "Can I order multiple cards?", a: "The standard order supports one to twenty cards at Rs. 999 each, all linked to the same profile. Contact us before ordering cards for different people." },
  { q: "Can I return a personalized card?", a: "Personalized cards are non-returnable and non-refundable once production starts, except where applicable law requires otherwise. Contact EdgeTap if your card arrives damaged, defective, wrongly supplied or incorrectly printed due to an EdgeTap production error so we can assess a remedy. Check the details you supply before approving production; customer-provided errors do not automatically qualify for a replacement or refund. See our Terms for details." },
];
