import type { CSSProperties } from "react";

export type IconName = "info" | "user" | "avatar" | "card" | "link" | "eye" | "truck" | "receipt" | "check" | "save" | "trash" | "close" | "pause" | "play" | "shield" | "pin" | "camera";

// Streamline Core, CC BY 4.0. Attribution: /icons/streamline/LICENSE.txt.
export default function Icon({ name, size = 20, className = "" }: { name: IconName; size?: number; className?: string }) {
  const style: CSSProperties = {
    width: size, height: size,
    maskImage: `url(/icons/streamline/${name}.svg)`,
    WebkitMaskImage: `url(/icons/streamline/${name}.svg)`,
  };
  return <span aria-hidden="true" className={`ui-icon ${className}`} style={style} />;
}
