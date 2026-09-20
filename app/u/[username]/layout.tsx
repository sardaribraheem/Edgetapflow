import { ibraheemProfile } from "@/lib/data/profile";

// Pre-render the brand profile — this exports the /u/ibraheem.html shell that
// the Firebase Hosting rewrite ("/u/**" → "/u/ibraheem") serves for EVERY other
// /u/<username>. There are no static per-customer pages; an arbitrary handle is
// resolved live from Firestore in the client route component below.
export function generateStaticParams() {
  return [{ username: ibraheemProfile.username }];
}

export default function UsernameLayout({ children }: { children: React.ReactNode }) {
  return children;
}