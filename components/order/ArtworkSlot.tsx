"use client";
import { useEffect, useState } from 'react';
import { getPrivateUploadBlob } from '@/lib/upload-service';

export default function ArtworkSlot({ face, source, disabled, onFile, onRemove }: { face: 'front' | 'back'; source?: string; disabled: boolean; onFile: (file: File) => void; onRemove: () => void }) {
  const [loaded, setLoaded] = useState(''), [error, setError] = useState('');
  useEffect(() => {
    let active = true, url = '';
    if (source?.startsWith('order-artwork/')) void getPrivateUploadBlob(source).then(blob => { if (active) { url = URL.createObjectURL(blob); setLoaded(url); setError(''); } }).catch(() => { if (active) setError('Preview unavailable. Replace the image to try again.'); });
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [source]);
  const preview = source?.startsWith('order-artwork/') ? loaded : source?.startsWith('data:') || source?.startsWith('blob:') ? source : '';
  return <div className="artwork-slot"><label className="artwork-drop-zone"><span className="font-display font-semibold">{face === 'front' ? 'Front' : 'Back'}</span><span className="artwork-face">{preview ? <img src={preview} alt={`Your ${face} artwork preview`}/> : <span><span aria-hidden="true" className="upload-arrow">↑</span>{source ? 'Loading preview…' : `Upload ${face}`}</span>}</span><span className="text-xs">{source ? 'Choose a replacement' : 'Choose an image'}</span><input disabled={disabled} aria-label={face === 'front' ? 'Card artwork image' : 'Back card artwork image'} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { if (e.target.files?.[0]) onFile(e.target.files[0]); e.target.value = ''; }} className="sr-only"/></label>{source && <button type="button" disabled={disabled} className="mt-2 min-h-11 text-sm underline" onClick={onRemove}>Remove {face}</button>}{error && <p role="alert" className="text-sm">{error}</p>}</div>;
}
