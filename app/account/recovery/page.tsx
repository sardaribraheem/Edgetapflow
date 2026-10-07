"use client";
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { auth, canResetPassword, onAuthStateChanged, updateRecoveredPassword } from '@/lib/auth';
export default function RecoveryPage() {
  const [ready,setReady]=useState(false);
  const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  useEffect(()=>onAuthStateChanged(auth,()=>{ setReady(canResetPassword()); }),[]);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try { await updateRecoveredPassword(password); setReady(false); setMessage('Password updated. You can sign in with your new password.'); }
    catch { setMessage('Could not update the password. Request a new recovery link and try again.'); }
    finally { setBusy(false); }
  }
  return <main className="min-h-screen grid place-items-center bg-[--cream] px-4 py-16"><section className="card-paper w-full max-w-md p-8">
    <h1 className="font-display text-3xl font-bold">Reset your password</h1>
    {ready ? <form onSubmit={submit} className="mt-6 space-y-4"><label className="block font-semibold">New password<input type="password" autoComplete="new-password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 block w-full rounded-xl border p-3" /></label><button className="btn btn-ink px-5 py-3" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button></form> : <p className="mt-4">Open the recovery link from your email to set a new password.</p>}
    {message && <p role="status" className="mt-4">{message}</p>}
    <Link href="/account" className="mt-6 inline-block font-bold underline">Back to sign in</Link>
  </section></main>;
}
