"use client";
import {useEffect,useRef,useState} from 'react';
import type {WizardDraft} from '@/lib/application';
import PhysicalCardControls from './PhysicalCardControls';
import Icon from '@/components/ui/Icon';
export default function CardEditorDialog({draft,onSave,onClose}:{draft:WizardDraft;onSave:(draft:WizardDraft)=>void;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),[working,setWorking]=useState(draft);
 useEffect(()=>{const el=dialog.current,previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;el?.showModal();document.body.style.overflow='hidden';return()=>{el?.close();document.body.style.overflow=overflow;previous?.focus();};},[]);
 return <dialog ref={dialog} aria-labelledby="card-editor-title" className="card-editor-dialog" onCancel={event=>{if(event.target!==event.currentTarget)return;event.preventDefault();onClose();}}>
  <header className="card-editor-header"><div><h2 id="card-editor-title" className="font-display text-xl font-bold">Customize your card</h2><p className="text-sm text-[var(--ink-soft)]">Select a side. Add text, drag it, and make it yours.</p></div><button type="button" aria-label="Close card editor" className="editor-close" onClick={onClose}><Icon name="close" size={20}/></button></header>
  <div className="card-editor-body"><PhysicalCardControls draft={working} onChange={patch=>setWorking(d=>({...d,...patch}))} dualFace/></div>
  <footer className="card-editor-footer"><button type="button" className="btn btn-ghost px-5 py-3" onClick={onClose}>Cancel</button><button type="button" className="btn btn-ink px-5 py-3" onClick={()=>{onSave(working);onClose();}}>Save design</button></footer>
 </dialog>;
}
