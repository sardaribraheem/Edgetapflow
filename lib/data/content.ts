// Site-wide content, kept separate from presentation.

export const nav = {
  brand: "EDGE TAP",
  links: [
    { label: "What We Offer", href: "#offer" },
    { label: "Solutions", href: "#solutions" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/u/ibraheem" },
  ],
  cta: { label: "Get Started", href: "#get-started" },
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
  {
    index: "01",
    tag: "Professionals",
    title: "NFC Business Cards",
    description:
      "Share your contact, WhatsApp, Instagram, LinkedIn, portfolio and website with one tap.",
    bullets: ["Contact", "WhatsApp", "Instagram", "LinkedIn", "Portfolio", "Website"],
    icon: "businessCard",
    tone: "yellow",
  },
  {
    index: "02",
    tag: "Offices",
    title: "Tap-Based Attendance",
    description:
      "Employees tap to check in, check out and record attendance. Build the office experience around NFC.",
    bullets: ["Check in", "Check out", "Attendance"],
    icon: "attendance",
    tone: "sky",
  },
  {
    index: "03",
    tag: "Your Website",
    title: "Professional Digital Presence",
    description:
      "A professional website, portfolio, personal profile and digital identity — always up to date.",
    bullets: ["Website", "Portfolio", "Profile", "Identity"],
    icon: "globe",
    tone: "mint",
  },
  {
    index: "04",
    tag: "Review Cards",
    title: "Tap → Google Review",
    description:
      "For restaurants, shops, businesses and service providers. One tap takes customers straight to leaving a review.",
    bullets: ["Restaurants", "Shops", "Businesses", "Services"],
    icon: "review",
    tone: "coral",
  },
  {
    index: "05",
    tag: "Restaurant Menus",
    title: "Tap → Menu",
    description:
      "A physical NFC-enabled card or sign. Customer taps. Menu opens. No app. No searching. Just tap.",
    bullets: ["No app", "Instant", "Always current"],
    icon: "menu",
    tone: "yellow",
  },
  {
    index: "06",
    tag: "Custom Needs",
    title: "Have something else in mind?",
    description:
      "EdgeTap isn't limited to predefined products. We build custom physical → digital experiences.",
    bullets: ["Custom NFC", "Anything you imagine"],
    icon: "custom",
    tone: "ink",
    custom: true,
  },
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
  {
    id: "meet",
    kicker: "Use case 01",
    headline: "Meet someone.",
    context:
      "Networking event, conference, university, business meeting. Instead of “can I get your number?”, the person taps.",
    icon: "card",
    tone: "yellow",
    phone: "profile",
  },
  {
    id: "restaurant",
    kicker: "Use case 02",
    headline: "At a restaurant.",
    context:
      "A physical NFC-enabled card on the table. Tap for menu. The digital menu opens — food, drinks, specials.",
    icon: "menu",
    tone: "coral",
    phone: "menu",
  },
  {
    id: "review",
    kicker: "Use case 03",
    headline: "Love the food?",
    context:
      "Tap to review. The customer taps the review card and the review experience appears. Tap → Review.",
    icon: "review",
    tone: "sky",
    phone: "review",
  },
];

// FAQ
export const faqs = [
  {
    q: "How does the NFC card work?",
    a: "Tap the physical EdgeTap card against any modern smartphone. It instantly opens your digital profile or experience in the browser — no app, no pairing, no friction.",
  },
  {
    q: "What if someone's phone doesn't support NFC?",
    a: "No problem. Every EdgeTap has a QR fallback that points to the same URL, so anyone can still reach your digital experience from any phone.",
  },
  {
    q: "Can I change my information later?",
    a: "Yes — your digital profile is always up to date. Update your links, menu, or details whenever you like, and the physical card keeps working exactly the same.",
  },
  {
    q: "Do I need an app?",
    a: "No. EdgeTap is an open-web experience. Your visitors tap and land straight in the browser. There's nothing to download on either side.",
  },
  {
    q: "Can you build custom NFC solutions?",
    a: "Absolutely. Beyond cards and menus, we design and build custom physical → digital experiences for your business. Tell us your idea and we'll build it.",
  },
  {
    q: "Can businesses order multiple cards?",
    a: "Yes. Our Business tier supports multiple NFC cards plus team management, so entire teams and locations can share one consistent experience.",
  },
];

// Testimonials — clearly-marked placeholder content (no real customers yet)
export const testimonials = [
  {
    quote:
      "Placeholder — share a story of someone meeting at a conference and swapping contacts with one tap.",
    author: "Your first customer",
    role: "Where your story begins",
    tone: "yellow",
  },
  {
    quote:
      "Placeholder — a restaurant owner whose menu updates the moment specials change.",
    author: "A restaurant owner",
    role: "Tap → Menu",
    tone: "coral",
  },
  {
    quote:
      "Placeholder — a founder who turned every introduction into a living digital profile.",
    author: "A founder",
    role: "One tap. Infinite possibilities.",
    tone: "sky",
  },
];
