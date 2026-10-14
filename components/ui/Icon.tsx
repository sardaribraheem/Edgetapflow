import type { CSSProperties } from "react";

export type IconName = "edit" | "mail" | "phone" | "refresh" | "info" | "user" | "avatar" | "card" | "link" | "eye" | "truck" | "receipt" | "check" | "save" | "trash" | "close" | "pause" | "play" | "shield" | "pin" | "camera";

// Streamline Core, CC BY 4.0. Attribution: /icons/streamline/LICENSE.txt.
export default function Icon({ name, size = 20, className = "" }: { name: IconName; size?: number; className?: string }) {
  // Original EdgeTap pencil; the remaining glyphs use the licensed Core assets.
  if (name === "edit") return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 5 4 4M4 20l5-1L20 8a2.8 2.8 0 0 0-4-4L5 15l-1 5Z"/></svg>;
  const style: CSSProperties = {
    width: size, height: size,
    maskImage: `url(/icons/streamline/${name}.svg)`,
    WebkitMaskImage: `url(/icons/streamline/${name}.svg)`,
  };
  return <span aria-hidden="true" className={`ui-icon ${className}`} style={style} />;
}
