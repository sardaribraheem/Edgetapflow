// Inline art tokens for fallback admin thumbnails when a source image is unavailable.
// Kept tiny and data-only — the actual card render is EdgeTapCard.
export const CARD_TEMPLATE_ART: Record<string, { bg: string; icon: string; text: string }> = {
  simple: { bg: "bg-white", icon: "text-[--ink]", text: "text-[--ink]" },
  lux: { bg: "bg-[--yellow-soft]", icon: "text-[--ink]", text: "text-[--ink]" },
  wood: { bg: "bg-[#d6a36a]", icon: "text-[--ink]", text: "text-[--ink]" },
  inverted: { bg: "bg-[--ink]", icon: "text-[--yellow]", text: "text-white" },
  upload: { bg: "bg-[--sky-soft]", icon: "text-[--ink]", text: "text-[--ink]" },
  designer: { bg: "bg-[--mint-soft]", icon: "text-[--ink]", text: "text-[--ink]" },
};