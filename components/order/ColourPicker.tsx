"use client";

import {useEffect,useId,useRef,useState,type PointerEvent} from 'react';
import {hexToHsv,hexToRgb,hsvToHex,rgbToHex,type Hsv} from '@/lib/colour';
import Icon from '@/components/ui/Icon';

const swatches=['#100b4a','#ffffff','#fff9e4','#f6d54d','#e13c61','#375ac6','#096b73','#171717'];

export default function ColourPicker({label,value,onChange}:{label:string;value:string;onChange:(colour:string)=>void}){
 const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null),id=useId();
 const [draft,setDraft]=useState({source:value,text:value});
 const [chosen,setChosen]=useState({hex:value,hsv:hexToHsv(value)});
 const hsv=chosen.hex===value?chosen.hsv:hexToHsv(value),rgb=hexToRgb(value);
 const text=draft.source===value?draft.text:value;
 const priorOverflow=useRef(''),opened=useRef(false),frame=useRef<number|undefined>(undefined);
 const pending=useRef<{s:number;v:number;h:number}|null>(null);
 const latest=useRef({hsv,onChange});
 useEffect(()=>{latest.current={hsv,onChange};},[hsv,onChange]);
 const commit=(next:Hsv)=>{const hex=hsvToHex(next);setChosen({hex,hsv:next});onChange(hex);};
 const flush=()=>{if(frame.current!==undefined){cancelAnimationFrame(frame.current);frame.current=undefined;}if(pending.current){const next=pending.current;pending.current=null;const hex=hsvToHex(next);setChosen({hex,hsv:next});latest.current.onChange(hex);}};
 const restore=()=>{if(opened.current){document.body.style.overflow=priorOverflow.current;opened.current=false;}trigger.current?.focus();};
 useEffect(()=>()=>{if(frame.current!==undefined)cancelAnimationFrame(frame.current);if(opened.current)document.body.style.overflow=priorOverflow.current;},[]);
 function point(event:PointerEvent<HTMLDivElement>){
  const rect=event.currentTarget.getBoundingClientRect();
  pending.current={h:latest.current.hsv.h,s:Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)),v:Math.max(0,Math.min(1,1-(event.clientY-rect.top)/rect.height))};
  if(frame.current===undefined)frame.current=requestAnimationFrame(flush);
 }
 function hexInput(raw:string){
  setDraft({source:value,text:raw});const candidate=raw.startsWith('#')?raw:'#'+raw;
  if(/^#[0-9a-f]{6}$/i.test(candidate)){const hex=candidate.toLowerCase();setChosen({hex,hsv:hexToHsv(hex)});onChange(hex);}
 }
 return <div className="colour-field">
  <label htmlFor={id}>{label.replace(/^(front|back) /,'')}</label>
  <div className="colour-field-value">
   <button ref={trigger} type="button" aria-label={'Choose '+label} aria-haspopup="dialog" className="colour-trigger" style={{background:value}} onClick={()=>{priorOverflow.current=document.body.style.overflow;document.body.style.overflow='hidden';opened.current=true;dialog.current?.showModal();}}/>
   <input id={id} aria-label={label} value={text} spellCheck={false} maxLength={7} onChange={e=>hexInput(e.target.value)} onBlur={()=>setDraft({source:value,text:value})}/>
  </div>
  <dialog ref={dialog} className="colour-dialog" aria-labelledby={id+'-title'} onClose={restore} onCancel={event=>event.stopPropagation()} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.current?.close();}}}>
   <div className="colour-dialog-heading"><h3 id={id+'-title'}>{label.replace(/^(front|back) /,'')}</h3><button type="button" className="icon-button" aria-label="Close colour picker" onClick={()=>dialog.current?.close()}><Icon name="close" size={18}/></button></div>
   <div className="colour-spectrum" aria-hidden="true" style={{backgroundColor:hsvToHex({h:hsv.h,s:1,v:1})}} onPointerDown={e=>{if(e.button!==0)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);point(e);}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))point(e);}} onPointerUp={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId)){point(e);flush();e.currentTarget.releasePointerCapture(e.pointerId);}}} onPointerCancel={flush}>
    <span style={{left:`${hsv.s*100}%`,top:`${(1-hsv.v)*100}%`,background:value}}/>
   </div>
   <label className="colour-hue-label">Hue<input className="colour-hue" aria-label="Hue" type="range" min={0} max={360} value={Math.round(hsv.h)} onChange={e=>commit({...hsv,h:Number(e.target.value)})}/></label>
   <div className="colour-adjustments"><label>Saturation<input aria-label="Saturation" type="range" min={0} max={100} value={Math.round(hsv.s*100)} onChange={e=>commit({...hsv,s:Number(e.target.value)/100})}/></label><label>Brightness<input aria-label="Brightness" type="range" min={0} max={100} value={Math.round(hsv.v*100)} onChange={e=>commit({...hsv,v:Number(e.target.value)/100})}/></label></div>
   <div className="colour-rgb">{(['R','G','B'] as const).map((channel,index)=><label key={channel}>{channel}<input aria-label={{R:'Red',G:'Green',B:'Blue'}[channel]} type="number" min={0} max={255} value={rgb[index]} onChange={e=>{if(e.target.value==='')return;const next=[...rgb] as [number,number,number];next[index]=Number(e.target.value);const hex=rgbToHex(...next);setChosen({hex,hsv:hexToHsv(hex)});onChange(hex);}}/></label>)}</div>
   <div className="colour-swatches" aria-label="Suggested colours">{swatches.map(hex=><button key={hex} type="button" aria-label={'Use '+hex} aria-pressed={value.toLowerCase()===hex} style={{background:hex}} onClick={()=>{setChosen({hex,hsv:hexToHsv(hex)});onChange(hex);}}/>)}</div>
   <button type="button" className="btn btn-ink colour-done" onClick={()=>dialog.current?.close()}>Done</button>
  </dialog>
 </div>;
}
