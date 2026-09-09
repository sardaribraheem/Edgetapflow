import { ibraheemProfile, profileContacts } from "@/lib/data/profile";
import {
  InstagramIcon,
  WhatsAppIcon,
  LinkedInIcon,
  GlobeIcon,
  SaveIcon,
} from "./doodles";

const iconFor = (type: string, className: string) => {
  switch (type) {
    case "instagram":
      return <InstagramIcon className={className} />;
    case "linkedin":
      return <LinkedInIcon className={className} />;
    case "portfolio":
      return <GlobeIcon className={className} />;
    default:
      return <WhatsAppIcon className={className} />;
  }
};

// Phone screen: the digital profile that opens after tapping a
// professional EdgeTap card (use case 01 / MEET SOMEONE).
export default function PhoneProfile() {
  const primary = ibraheemProfile.links.filter((l) =>
    ["whatsapp", "linkedin", "instagram", "portfolio"].includes(l.type),
  );

  return (
    <div className="flex h-full flex-col px-4 pt-12">
      {/* avatar + name */}
      <div className="flex flex-col items-center pt-2">
        <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-[--yellow] ring-2 ring-[--ink]/10">
          <img
            src={ibraheemProfile.avatar}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>
        <div className="mt-2 font-display text-[17px] font-semibold leading-none text-[--ink]">
          {ibraheemProfile.displayName}
        </div>
        <div className="mt-1 text-[11px] font-medium text-[--ink-mid]">
          {ibraheemProfile.title}
        </div>
        <div className="mt-0.5 text-[10px] text-[--ink-faint]">
          📍 {ibraheemProfile.location}
        </div>
      </div>

      {/* action chips */}
      <div className="mt-4 flex flex-col gap-2">
        {primary.map((l) => (
          <div
            key={l.type}
            className="flex items-center gap-2.5 rounded-full border border-[--ink]/8 bg-white px-3 py-2"
            style={{ boxShadow: "0 4px 0 -2px rgba(16,11,74,0.12)" }}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[--ink]/5 text-[--ink] ring-1 ring-[--ink]/10">
              {iconFor(l.type, "h-4 w-4")}
            </span>
            <span className="flex-1 text-[12px] font-semibold text-[--ink]">
              {l.label}
            </span>
            <span className="text-[12px] text-[--ink-faint]">→</span>
          </div>
        ))}

        {/* save contact */}
        <div className="flex items-center gap-2.5 rounded-full bg-[--ink] px-3 py-2 text-white">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[--yellow] text-[--ink]">
            <SaveIcon className="h-4 w-4" />
          </span>
          <span className="flex-1 text-[12px] font-semibold">
            {profileContacts[0].label}
          </span>
          <span className="text-[12px] text-white/60">→</span>
        </div>
      </div>

      {/* powered by */}
      <div className="mt-auto flex items-center justify-center gap-1 pb-3 pt-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-[--ink-faint]">
        <span className="h-1.5 w-1.5 rounded-full bg-[--ink]" /> Powered by EdgeTap
      </div>
    </div>
  );
}
