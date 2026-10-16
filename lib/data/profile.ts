// Single source of truth for the EdgeTap profile data.
// Used by the /u/ibraheem profile route AND the marketing site's
// use-case storytelling (MEET SOMEONE -> digital profile).

export type ProfileLink = {
  type: string;
  label: string;
  url: string;
  icon: string;
  accent: string; // tailwind bg color for the action chip
};

export type Profile = {
  username: string;
  displayName: string;
  firstName: string;
  lastName: string;
  title: string;
  bio: string;
  location: string;
  avatar: string;
  logo?: string;
  links: ProfileLink[];
  ownerUid?: string; // Backend auth identifier; omitted from anonymous Supabase responses
  profileId?: string; // stable internal profile ID (username is a mutable public handle)
  active?: boolean; // published / hidden
  createdAt?: number; // epoch ms
  updatedAt?: number; // epoch ms
  version?: number;
};

export const ibraheemProfile: Profile = {
  username: "ibraheem",
  displayName: "Ibraheem Anwar",
  firstName: "Ibraheem",
  lastName: "Anwar",
  title: "Developer & AI Engineer",
  bio: "I Design Software, build Flutter apps, AI integrations, and automation systems that solve real problems. Clean architecture, fast iteration, shipped products.",
  location: "Pakistan",
  avatar: "/ibraheem.png",
  links: [
    {
      type: "whatsapp",
      label: "WhatsApp",
      url: "https://wa.me/923044149674",
      icon: "whatsapp",
      accent: "#25D366",
    },
    {
      type: "linkedin",
      label: "LinkedIn",
      url: "https://linkedin.com/sardaribraheem",
      icon: "linkedin",
      accent: "#0A66C2",
    },
    {
      type: "instagram",
      label: "Instagram",
      url: "https://www.instagram.com/ibraheemr.dev",
      icon: "instagram",
      accent: "#E1306C",
    },
    {
      type: "portfolio",
      label: "Portfolio",
      url: "https://ibraheem.dev",
      icon: "globe",
      accent: "#7FA8FF",
    },
    {
      type: "github",
      label: "GitHub",
      url: "https://github.com/sardaribraheem",
      icon: "github",
      accent: "#100B4A",
    },
    {
      type: "email",
      label: "Email",
      url: "mailto:sardaribraheem277@gmail.com",
      icon: "mail",
      accent: "#FF6B5B",
    },
  ],
};

// Contact fields surfaced as quick chips on the profile.
export const profileContacts = [
  { label: "Save Contact", icon: "contact", accent: "#100B4A" },
  { label: "Website", icon: "globe", accent: "#7FA8FF" },
];
