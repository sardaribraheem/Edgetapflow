// Inline art tokens for the four card template thumbnails shown in admin.
// Kept tiny and data-only — the actual card render is EdgeTapCard.
export const CARD_TEMPLATE_ART: Record<string, { bg: string; icon: string; text: string }> = {
  classic: { bg: "bg-white", icon: "text-[--ink]", text: "text-[--ink]" },
  bold: { bg: "bg-[--ink]", icon: "text-[--yellow]", text: "text-white" },
  executive: { bg: "bg-[--mint-soft]", icon: "text-[--ink]", text: "text-[--ink]" },
  custom: { bg: "bg-[--sky-soft]", icon: "text-[--ink]", text: "text-[--ink]" },
};