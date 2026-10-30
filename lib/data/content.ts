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
  { title: "Make it yours", description: "Choose a customizable card and preview its design, or pick a standard tag/card from the detailed price chart. Add the contact details and destination that your selected option needs." },
  { title: "Save and submit", description: "Sign in or create an account to save your details. Choose a payment method and add a transfer reference or optional receipt. We will check the actual payment." },
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
    bullets: ["Choose your card", "Choose a card design", "No visitor app"], icon: "businessCard", tone: "yellow" },
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
  { q: "Which card should I choose?", a: "Link Card opens your existing portfolio, social page or website. The customizable Profile Card package adds profile setup help. Both include a physical NFC card, customizable front/back, optional QR and delivery where coverage is confirmed. For a lower-cost option, create your free profile yourself and buy standard hardware from the detailed price chart; those prices are for pickup." },
  { q: "How does the NFC card work?", a: "Hold your card near the NFC reader on a compatible phone and open the notification. Your profile opens in the browser. Reader position and NFC settings vary by phone; internet access is required." },
  { q: "What if a phone does not support NFC?", a: "If your chosen printed card includes a QR, scan it with the phone camera to open the same destination. Raw tags and unprinted cards do not include a printed QR. You can also share your profile link directly." },
  { q: "Can I change my information later?", a: "Sign in and choose Edit profile from the side menu to update your details and links. Your physical card keeps the same profile URL." },
  { q: "How do I order and pay?", a: "Open Pricing. For a customizable card, choose its design and details first; the draft stays on this device until you sign in before payment. For standard hardware from the detailed chart, sign in first, then choose a destination and review the server quote. Submit a transfer reference or optional private receipt for staff review. Website packages and custom NFC projects are arranged by contacting EdgeTap. Confirm the amount and selected recipient before transferring. Customizable card offers include delivery where coverage is confirmed; detailed hardware prices are for pickup, with delivery quoted separately. NASTP Delta 3 pickup is Monday–Friday, 9 am–5 pm (Pakistan time); contact +92 304 414 9674 after reaching NASTP once your card is ready. Standard digital profile hosting and updates have no separate fee for now. Follow review decisions and next steps on My orders; a receipt upload does not verify payment." },
  { q: "Can I order multiple cards?", a: "Yes. Add matching cards to your order or select an available bundle in checkout. The current prices are shown before payment. Cards in one order share the same design and destination. If you already own an active EdgeTap profile, select it to order more cards without creating another profile. Extra profile links are charged once for a new profile." },
  { q: "Can I return a personalized card?", a: "Personalized cards cannot be returned unless they arrive damaged or defective, or EdgeTap made a printing or supply error. Record an unboxing video as proof of any damage on arrival. Contact us with your order number and video. Check your details before approving the design. See our Terms for the full policy and your rights." },
];
