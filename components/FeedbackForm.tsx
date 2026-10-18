"use client";
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import Icon from './ui/Icon';
import { onAuthStateChanged, auth, type User } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

const key = 'edgetap-feedback-draft';
export default function FeedbackForm() {
  const [text, setText] = useState(''), [rating, setRating] = useState('5'), [user, setUser] = useState<User | null>(null), [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [needsSignIn, setNeedsSignIn] = useState(false);
  const lock = useRef(false);
  useEffect(() => { let initial=true; return onAuthStateChanged(auth,value=>{if(initial){initial=false;try{const saved=JSON.parse(sessionStorage.getItem(key)||'null');if(saved){setText(String(saved.text||''));setRating(String(saved.rating||'5'));}}catch{}}setUser(value);}); }, []);
  function persist(value: string, stars: string) { try { sessionStorage.setItem(key, JSON.stringify({ text: value, rating: stars })); } catch {} }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (lock.current) return; persist(text, rating); setMessage('');
    if (!user) { setNeedsSignIn(true); return; }
    lock.current = true; setBusy(true);
    try { const { error } = await getSupabase().rpc('submit_feedback', { p_text: text.trim(), p_rating: Number(rating) }); if (error) throw error; setText(''); setNeedsSignIn(false); try { sessionStorage.removeItem(key); } catch {} setMessage('Thank you. Your feedback has reached EdgeTap.'); }
    catch { setMessage('Could not send your feedback. Your text is retained; please try again.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <form onSubmit={submit} className="landing-feedback text-left"><h3 className="font-display text-2xl">Tell us what you think</h3><p className="mt-2 text-sm opacity-80">A review, an idea, or something we can improve.</p><fieldset className="mt-4"><legend className="text-sm font-semibold">Your rating</legend><div className="feedback-stars">{[1,2,3,4,5].map(n => <label key={n} className={n <= Number(rating) ? 'is-filled' : ''}><input type="radio" className="feedback-star-radio" name="feedback-rating" aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`} value={n} checked={rating === String(n)} onChange={() => { setRating(String(n)); persist(text, String(n)); }}/><Icon name="star" size={20} /></label>)}</div></fieldset><label className="mt-4 block text-sm font-semibold">Your feedback<textarea aria-label="Your feedback" required minLength={3} maxLength={2000} rows={4} value={text} onChange={e => { setText(e.target.value); persist(e.target.value, rating); }} className="mt-2 w-full rounded-xl bg-white p-3 text-[var(--ink)]"/></label><button type="submit" disabled={busy} className="btn btn-yellow mt-4 px-5 py-3">{busy ? 'Sending…' : 'Submit feedback'}</button>{needsSignIn && !user && <div className="mt-4" role="status">Sign in to submit. Your feedback will be kept.<Link href="/account?next=%2F%23custom" className="ml-2 underline">Sign in</Link></div>}{message && <p role="status" className="mt-4 text-sm">{message}</p>}</form>;
}
