// Site-wide content, kept separate from presentation.

export const nav = {
  brand: "EDGE TAP",
  links: [
    { label: "What We Offer", href: "/#offer" },
    { label: "How It Works", href: "/#solutions" },
    { label: "Pricing", href: "/pricing" },
    { label: "FAQs", href: "/#faq" },
  ],
  cta: { label: "Get Your EdgeTap", href: "/pricing" },
};

export const orderingSteps = [
  { title: "Make it yours", description: "Choose a card design, add your contact details and links, and preview your digital profile. EdgeTap prepares the final card proof after acceptance." },
  { title: "Save and submit", description: "Sign in or create an account to save your details. Submit your JazzCash payment proof for staff review." },
  { title: "Track your card", description: "Follow review requests and progress in My orders. Collect at NASTP when ready, or pay the booked rider separately for delivery." },
];

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
    bullets: ["Cards from Rs. 999", "Choose a card design", "No visitor app"], icon: "businessCard", tone: "yellow" },
  { index: "02", tag: "Your profile", title: "Your Contact Details & Links",
    description: "Your contacts, socials and story in one place. Update your profile as your world grows.",
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
    context: "At a meeting or event, touch your card to the NFC reader on a compatible phone. Open the notification to visit your profile.",
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
  { q: "Which card should I choose?", a: "Link Card (Rs. 999) opens your existing portfolio, social page or website. EdgeTap Profile (Rs. 1,499) includes your editable profile for your contacts and links. Both include a physical NFC card, customizable front/back and optional QR. Delivery is separate." },
  { q: "How does the NFC card work?", a: "Hold your card near the NFC reader on a compatible phone and open the notification. Your profile opens in the browser. Reader position and NFC settings vary by phone; internet access is required." },
  { q: "What if a phone does not support NFC?", a: "Scan the QR code on the card with the phone camera. It links to the same digital profile, so NFC is optional." },
  { q: "Can I change my information later?", a: "Sign in with your checkout account and open your activated profile to update your details and links. Your physical card keeps the same profile URL." },
  { q: "How do I order and pay?", a: "Start at Pricing and choose the standard card. Choose the design and add its details without an account; your draft stays on this device. Create an account or sign in just before payment to save your profile details, then submit private JazzCash proof for staff review. Website packages and custom NFC projects are arranged by contacting EdgeTap. Confirm the card amount and JazzCash recipient before transferring. Delivery costs extra: EdgeTap books a rider when your paid card is ready and you pay the rider directly. The actual fare appears on My orders. NASTP Delta 3 pickup is Monday–Friday, 9 am–5 pm (Pakistan time); contact +92 304 414 9674 after reaching NASTP once your card is ready. Standard digital profile hosting and updates have no separate fee for now. Follow review decisions and next steps on My orders; a receipt upload does not verify payment." },
  { q: "Can I order multiple cards?", a: "Order one to twenty identical cards: Rs. 999 each for Link Card or Rs. 1,499 each for EdgeTap Profile, all opening the same destination. Contact us before ordering cards for different people." },
  { q: "Can I return a personalized card?", a: "Personalized cards are non-returnable and non-refundable once production starts, except where applicable law requires otherwise. Contact EdgeTap if your card arrives damaged, defective, wrongly supplied or incorrectly printed due to an EdgeTap production error so we can assess a remedy. Check the details you supply before approving production; customer-provided errors do not automatically qualify for a replacement or refund. See our Terms for details." },
];
