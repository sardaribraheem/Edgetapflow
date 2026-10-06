import Link from "next/link";
export default function NotFound() {
  return <main className="min-h-screen grid place-items-center p-6 text-center"><div>
    <p className="eyebrow">EdgeTap · 404</p><h1 className="font-display text-4xl mt-4">Page not found</h1>
    <p className="mt-4">Check the address or return to EdgeTap.</p><Link href="/" className="btn btn-ink mt-6 px-6 py-3">Return home</Link>
  </div></main>;
}
