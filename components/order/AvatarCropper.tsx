"use client";
import { useEffect, useRef, useState } from 'react';

export default function AvatarCropper({ file, onCancel, onConfirm }: { file: File; onCancel: () => void; onConfirm: (file: File) => void }) {
  const dialog = useRef<HTMLDialogElement>(null), canvas = useRef<HTMLCanvasElement>(null), image = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false), [zoom, setZoom] = useState(1), [x, setX] = useState(50), [y, setY] = useState(50), [error, setError] = useState('');
  useEffect(() => {
    const url = URL.createObjectURL(file), picture = new window.Image(); let active = true;
    image.current = picture;
    picture.onload = () => { if (active) setReady(true); };
    picture.onerror = () => { if (active) setError('Could not read this photo. Choose another image.'); };
    picture.src = url;
    dialog.current?.showModal();
    const previous = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { active = false; URL.revokeObjectURL(url); document.body.style.overflow = previous; };
  }, [file]);
  useEffect(() => {
    const picture = image.current, context = canvas.current?.getContext('2d');
    if (!ready || !picture || !context) return;
    const side = Math.min(picture.naturalWidth, picture.naturalHeight) / zoom;
    context.clearRect(0, 0, 512, 512);
    context.drawImage(picture, (picture.naturalWidth - side) * x / 100, (picture.naturalHeight - side) * y / 100, side, side, 0, 0, 512, 512);
  }, [ready, zoom, x, y]);
  function confirm() {
    canvas.current?.toBlob(blob => { if (blob) onConfirm(new File([blob], 'profile-photo.png', { type: 'image/png' })); else setError('Could not crop the photo. Please retry.'); }, 'image/png');
  }
  return <dialog ref={dialog} className="help-dialog crop-dialog" aria-labelledby="crop-title" onCancel={event => { event.preventDefault(); onCancel(); }}>
    <div className="help-dialog-content"><h2 id="crop-title" className="font-display text-2xl">Crop your photo</h2><canvas ref={canvas} width={512} height={512} className="avatar-crop-preview" aria-label="Cropped profile photo preview"/>
      <label className="crop-range">Zoom<input aria-label="Photo zoom" type="range" min={1} max={4} step={0.05} value={zoom} onChange={e => setZoom(Number(e.target.value))}/></label>
      <label className="crop-range">Horizontal position<input aria-label="Photo horizontal position" type="range" min={0} max={100} value={x} onChange={e => setX(Number(e.target.value))}/></label>
      <label className="crop-range">Vertical position<input aria-label="Photo vertical position" type="range" min={0} max={100} value={y} onChange={e => setY(Number(e.target.value))}/></label>
      {error && <p role="alert">{error}</p>}<div className="mt-5 flex justify-between gap-3"><button type="button" className="btn btn-ghost px-5 py-3" onClick={onCancel}>Cancel</button><button type="button" className="btn btn-ink px-5 py-3" disabled={!ready || !!error} onClick={confirm}>Use photo</button></div>
    </div>
  </dialog>;
}
