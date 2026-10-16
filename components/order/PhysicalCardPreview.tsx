"use client";

import {useEffect,useRef,useState,type CSSProperties,type KeyboardEvent,type PointerEvent} from 'react';
import {renderCardFace,type CardRenderInput} from '@/lib/card-renderer';
import {cardPoint,constrainText,normaliseRotation,resolveCardText,type TextBox} from '@/lib/card-editor';
import {clampQrPosition,CARD_WIDTH_MM as W,CARD_HEIGHT_MM as H,DEFAULT_PRINT_SETTINGS,type CardText,type PhysicalCard} from '@/lib/physical-card';
import Icon from '@/components/ui/Icon';

type Props={
 input:CardRenderInput;
 onPlace?:(qr:PhysicalCard['qr'])=>void;
 placeOnBackground?:boolean;
 selectedTextId?:string|null;
 onSelectText?:(id:string|null)=>void;
 onTextChange?:(id:string,patch:Partial<CardText>)=>void;
 onRemoveText?:(id:string)=>void;
};
type Point={x:number;y:number};
type Gesture={kind:'move'|'resize'|'rotate'|'qr';face:string;start:Point;centre:Point;layer?:CardText;box?:TextBox;qr:PhysicalCard['qr'];angle:number;distance:number};

export default function PhysicalCardPreview(props:Props){
 const {input,onPlace,placeOnBackground=false,selectedTextId,onSelectText,onTextChange,onRemoveText}=props;
 const target=useRef<HTMLCanvasElement>(null),stage=useRef<HTMLDivElement>(null);
 const [error,setError]=useState(''),[warnings,setWarnings]=useState<string[]>([]),[boxes,setBoxes]=useState<TextBox[]>([]);
 const latest=useRef(props),gesture=useRef<Gesture|null>(null),frame=useRef<number|undefined>(undefined),pending=useRef<(Point&{shift:boolean})|null>(null);
 useEffect(()=>{latest.current=props;},[props]);
 useEffect(()=>{
  let active=true;
  void renderCardFace({...input,settings:{...(input.settings||DEFAULT_PRINT_SETTINGS),dpi:300}}).then(result=>{
   if(!active||!target.current)return;
   target.current.width=result.canvas.width;target.current.height=result.canvas.height;
   target.current.getContext('2d')?.drawImage(result.canvas,0,0);
   setError('');setWarnings(result.warnings);setBoxes(result.textBoxes);
  }).catch(e=>{if(active)setError(e instanceof Error?e.message:'Card preview unavailable.');});
  return()=>{active=false;};
 },[input]);
 useEffect(()=>()=>{if(frame.current!==undefined)cancelAnimationFrame(frame.current);},[]);
 const bleed=input.settings?.bleedMm||0,flipped=input.face==='back'&&input.settings?.orientation==='short-edge';
 const side=input.physical.editor?.[input.face],editable=!!onTextChange;
 const point=(x:number,y:number)=>cardPoint(x,y,stage.current!.getBoundingClientRect(),bleed,flipped);
 const qrPlace=(x:number,y:number)=>onPlace?.({...input.physical.qr,face:input.face,placement:'marked',...clampQrPosition(x,y,input.physical.qr.sizeMm,input.settings?.safeMm)});
 function applyPending(){
  if(frame.current!==undefined){cancelAnimationFrame(frame.current);frame.current=undefined;}
  const g=gesture.current,p=pending.current,live=latest.current;pending.current=null;
  if(!g||!p||live.input.face!==g.face)return;
  if(Math.hypot((p.x-g.start.x)*W,(p.y-g.start.y)*H)<.001)return;
  const safe=live.input.settings?.safeMm||3;
  if(g.kind==='qr'){live.onPlace?.({...g.qr,face:live.input.face,placement:'marked',...clampQrPosition(g.qr.x+p.x-g.start.x,g.qr.y+p.y-g.start.y,g.qr.sizeMm,safe)});return;}
  if(!g.layer||!g.box)return;
  let patch:Partial<CardText>;
  if(g.kind==='move')patch={x:g.layer.x+p.x-g.start.x,y:g.layer.y+p.y-g.start.y};
  else if(g.kind==='resize')patch={sizeMm:g.layer.sizeMm*Math.hypot((p.x-g.centre.x)*W,(p.y-g.centre.y)*H)/Math.max(1,g.distance)};
  else{const angle=Math.atan2((p.y-g.centre.y)*H,(p.x-g.centre.x)*W)*180/Math.PI;const rotation=normaliseRotation((g.layer.rotation||0)+angle-g.angle);patch={rotation:p.shift?Math.round(rotation/15)*15:Math.round(rotation)};}
  const next=constrainText(g.layer,g.box,patch,safe);
  live.onTextChange?.(g.layer.id,{x:next.x,y:next.y,sizeMm:next.sizeMm,rotation:next.rotation});
 }
 function begin(e:PointerEvent<HTMLButtonElement>,kind:Gesture['kind'],layer?:CardText,box?:TextBox){
  if(e.button!==0||!stage.current||gesture.current)return;
  e.preventDefault();e.stopPropagation();e.currentTarget.focus();e.currentTarget.setPointerCapture(e.pointerId);
  const start=point(e.clientX,e.clientY),centre=layer?{x:layer.x,y:layer.y}:{x:input.physical.qr.x,y:input.physical.qr.y};
  gesture.current={kind,face:input.face,start,centre,layer,box,qr:input.physical.qr,angle:Math.atan2((start.y-centre.y)*H,(start.x-centre.x)*W)*180/Math.PI,distance:Math.hypot((start.x-centre.x)*W,(start.y-centre.y)*H)};
  onSelectText?.(layer?.id||null);
 }
 function move(e:PointerEvent<HTMLButtonElement>){
  if(!e.currentTarget.hasPointerCapture(e.pointerId)||!gesture.current)return;
  e.preventDefault();pending.current={...point(e.clientX,e.clientY),shift:e.shiftKey};
  if(frame.current===undefined)frame.current=requestAnimationFrame(applyPending);
 }
 function finish(e:PointerEvent<HTMLButtonElement>){
  if(!e.currentTarget.hasPointerCapture(e.pointerId))return;
  move(e);applyPending();gesture.current=null;e.currentTarget.releasePointerCapture(e.pointerId);
 }
 function keyText(e:KeyboardEvent<HTMLButtonElement>,layer:CardText,box:TextBox){
  const d=(flipped?-1:1)*(e.shiftKey?2:.5),moves:Record<string,Partial<CardText>>={ArrowLeft:{x:layer.x-d/W},ArrowRight:{x:layer.x+d/W},ArrowUp:{y:layer.y-d/H},ArrowDown:{y:layer.y+d/H},'+':{sizeMm:layer.sizeMm+.25},'=':{sizeMm:layer.sizeMm+.25},'-':{sizeMm:layer.sizeMm-.25},'[':{rotation:(layer.rotation||0)-5},']':{rotation:(layer.rotation||0)+5}};
  if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();e.stopPropagation();onRemoveText?.(layer.id);}
  else if(moves[e.key]){e.preventDefault();e.stopPropagation();const next=constrainText(layer,box,moves[e.key],input.settings?.safeMm);onTextChange?.(layer.id,{x:next.x,y:next.y,sizeMm:next.sizeMm,rotation:next.rotation});}
 }
 function qrKey(e:KeyboardEvent<HTMLButtonElement>){
  const q=input.physical.qr,d=(flipped?-1:1)*(e.shiftKey?.05:.02),moves:Record<string,Point>={ArrowLeft:{x:-d,y:0},ArrowRight:{x:d,y:0},ArrowUp:{x:0,y:-d},ArrowDown:{x:0,y:d}};
  if(moves[e.key]){e.preventDefault();qrPlace(q.x+moves[e.key].x,q.y+moves[e.key].y);}
 }
 function position(x:number,y:number,width:number,height:number,rotation=0):CSSProperties{
  return {left:`${((flipped?W-x*W:x*W)+bleed)/(W+2*bleed)*100}%`,top:`${((flipped?H-y*H:y*H)+bleed)/(H+2*bleed)*100}%`,width:`${width/(W+2*bleed)*100}%`,height:`${height/(H+2*bleed)*100}%`,transform:`translate(-50%,-50%) rotate(${rotation+(flipped?180:0)}deg)`};
 }
 const handlers={onPointerMove:move,onPointerUp:finish,onPointerCancel:()=>{applyPending();gesture.current=null;},onLostPointerCapture:()=>{applyPending();gesture.current=null;}};
 return <figure className="physical-card-figure">
  <div ref={stage} style={{aspectRatio:`${W+2*bleed}/${H+2*bleed}`}} className={'physical-card-canvas '+(placeOnBackground?'is-positioning ':'')+(editable?'is-editable':'')}>
   <canvas ref={target} role="img" aria-label={`${input.face} card: ${input.templateId==='upload'?'uploaded design':input.name||'Your name'}${input.physical.qr.enabled&&input.physical.qr.face===input.face?' with QR':''}`}/>
   {placeOnBackground&&onPlace&&<button type="button" className="qr-placement-surface" aria-label={'Place QR on '+input.face} onKeyDown={qrKey} onClick={e=>{const p=e.detail===0?{x:input.physical.qr.x,y:input.physical.qr.y}:point(e.clientX,e.clientY);qrPlace(p.x,p.y);onSelectText?.(null);}}/>}
   {editable&&side?.text.map(layer=>{
    const box=boxes.find(b=>b.id===layer.id),text=resolveCardText(layer,input.name,input.title),selected=layer.id===selectedTextId;
    if(!box||!text)return null;
    const ratio=layer.sizeMm/box.sizeMm;
    return <div className={'card-text-object '+(selected?'is-selected':'')} key={layer.id} style={position(layer.x,layer.y,box.widthMm*ratio,box.heightMm*ratio,layer.rotation||0)}>
     <button type="button" className="card-text-hit" aria-label={'Move text: '+text} aria-pressed={selected} onFocus={()=>onSelectText?.(layer.id)} onKeyDown={e=>keyText(e,layer,box)} onPointerDown={e=>begin(e,'move',layer,box)} {...handlers}/>
     {selected&&<>
      <button type="button" className="text-handle text-rotate" aria-label="Rotate text" title="Drag to rotate; arrow keys turn 5°" onKeyDown={e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const next=constrainText(layer,box,{rotation:(layer.rotation||0)+(['ArrowLeft','ArrowDown'].includes(e.key)?-5:5)},input.settings?.safeMm);onTextChange?.(layer.id,{x:next.x,y:next.y,sizeMm:next.sizeMm,rotation:next.rotation});}}} onPointerDown={e=>begin(e,'rotate',layer,box)} {...handlers}><span aria-hidden="true">↻</span></button>
      <button type="button" className="text-handle text-delete" aria-label="Delete selected text" title="Delete text" onClick={e=>{e.stopPropagation();onRemoveText?.(layer.id);}}><Icon name="trash" size={14}/></button>
      <button type="button" className="text-handle text-resize" aria-label="Resize text" title="Drag to resize; + or − keys change size" onKeyDown={e=>keyText(e,layer,box)} onPointerDown={e=>begin(e,'resize',layer,box)} {...handlers}><span aria-hidden="true">↔</span></button>
     </>}
    </div>;
   })}
   {onPlace&&input.physical.qr.enabled&&input.physical.qr.face===input.face&&<button type="button" className="card-qr-hit" style={position(input.physical.qr.x,input.physical.qr.y,input.physical.qr.sizeMm,input.physical.qr.sizeMm)} aria-label={'Move QR on '+input.face} title="Drag QR to move" onKeyDown={qrKey} onPointerDown={e=>begin(e,'qr')} {...handlers}/>}
   {error&&<p role="alert" className="physical-card-error">{error}</p>}
  </div>
  <figcaption>{input.face==='front'?'Front':'Back'}{editable?<span> · Drag text · ↔ resize · ↻ rotate</span>:placeOnBackground?<span> · Tap the QR spot or use arrow keys</span>:null}</figcaption>
  {warnings.length>0&&<details className="physical-card-warnings"><summary>Check artwork</summary>{warnings.map(w=><p key={w}>{w}</p>)}</details>}
 </figure>;
}
