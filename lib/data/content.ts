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
  { title: "Save and submit", description: "Sign in or create an account to save your details. Choose a payment method and upload your receipt. We will check the payment." },
  { title: "Track your card", description: "Follow review requests and progress in My orders. Collect at NASTP when ready, or choose delivery." },
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
    description: "Your phone number, social links and bio in one place. Change your details whenever you need to.",
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
    context: "Hold your card near a phone with NFC. Tap the notification to open your profile.",
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
  { q: "Which card should I choose?", a: "Link Card (Rs. 999) opens your existing portfolio, social page or website. EdgeTap Profile (Rs. 1499) includes your editable profile for your contacts and links. Both include a physical NFC card, customizable front/back and optional QR." },
  { q: "How does the NFC card work?", a: "Hold your card near the NFC reader on a compatible phone and open the notification. Your profile opens in the browser. Reader position and NFC settings vary by phone; internet access is required." },
  { q: "What if a phone does not support NFC?", a: "Scan the QR code on the card with the phone camera. It links to the same digital profile, so NFC is optional." },
  { q: "Can I change my information later?", a: "Sign in with your checkout account and open your activated profile to update your details and links. Your physical card keeps the same profile URL." },
  { q: "How do I order and pay?", a: "Open Pricing and choose your card. Choose the design and add its details without an account; your draft stays on this device. Create an account or sign in just before payment to save your profile details, then submit private payment proof for staff review. Website packages and custom NFC projects are arranged by contacting EdgeTap. Confirm the amount and selected recipient before transferring. EdgeTap arranges delivery when your card is ready. NASTP Delta 3 pickup is Monday–Friday, 9 am–5 pm (Pakistan time); contact +92 304 414 9674 after reaching NASTP once your card is ready. Standard digital profile hosting and updates have no separate fee for now. Follow review decisions and next steps on My orders; a receipt upload does not verify payment." },
  { q: "Can I order multiple cards?", a: "Yes. Start with a Link Card for Rs. 999 or a Profile Card for Rs. 1499, then add matching cards for Rs. 700 each. Claim a bundle in checkout: two Profile Cards for Rs. 2099 or three for Rs. 2499; two Link Cards for Rs. 1599 or three for Rs. 1999. Changing quantity returns to regular pricing. Cards in one order share the same design and destination. Cards for an existing profile you own cost Rs. 700 each. Extra profile links are charged once for a new profile." },
  { q: "Can I return a personalized card?", a: "Personalized cards cannot be returned unless they arrive damaged or defective, or EdgeTap made a printing or supply error. Record an unboxing video as proof of any damage on arrival. Contact us with your order number and video. Check your details before approving the design. See our Terms for the full policy and your rights." },
];
