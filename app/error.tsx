"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="min-h-screen grid place-items-center p-6 text-center"><div>
    <h1 className="font-display text-3xl">Something went wrong</h1><p className="mt-4">Please try loading this page again.</p>
    <button onClick={reset} className="btn btn-ink mt-6 px-6 py-3">Try again</button>
  </div></main>;
}
