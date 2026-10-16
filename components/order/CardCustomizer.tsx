"use client";

import {CARD_FONTS,blankCardEditor,type CardFace,type CardEditor,type CardText} from '@/lib/physical-card';
import type {WizardDraft} from '@/lib/application';
import Icon from '@/components/ui/Icon';
import ColourPicker from './ColourPicker';

export default function CardCustomizer({draft,face,name,selectedId,onSelect,onChange}:{draft:WizardDraft;face:CardFace;name:string;selectedId:string|null;onSelect:(id:string|null)=>void;onChange:(patch:Partial<WizardDraft>)=>void}){
 const editor=draft.physical.editor||blankCardEditor(),side=editor[face];
 const layer=side.text.find(t=>t.id===selectedId);
 const save=(next:CardEditor)=>onChange({physical:{...draft.physical,editor:next}});
 const updateSide=(patch:Partial<typeof side>)=>save({...editor,[face]:{...side,...patch}});
 const patch=(changes:Partial<CardText>)=>updateSide({text:side.text.map(t=>t.id===selectedId?{...t,...changes}:t)});
 return <div className="card-customizer">
  <div className="customizer-colours">
   <ColourPicker label={`${face} background colour`} value={side.background.colour} onChange={colour=>updateSide({background:{...side.background,colour}})}/>
   <label className="customizer-gradient-toggle"><input type="checkbox" checked={!!side.background.gradient} onChange={e=>updateSide({background:{...side.background,gradient:e.target.checked?{end:'#f6d54d',angle:135}:undefined}})}/>Gradient</label>
   {side.background.gradient&&<>
    <ColourPicker label={`${face} gradient colour`} value={side.background.gradient.end} onChange={end=>updateSide({background:{...side.background,gradient:{...side.background.gradient!,end}}})}/>
    <label>Angle<input type="range" aria-label="Gradient angle" min={0} max={360} value={side.background.gradient.angle} onChange={e=>updateSide({background:{...side.background,gradient:{...side.background.gradient!,angle:Number(e.target.value)}}})}/></label>
   </>}
  </div>
  <div className="gradient-presets" aria-label="Background presets">
   {[["Midnight","#100b4a","#375ac6"],["Sunset","#d93b5b","#f6d54d"],["Ocean","#096b73","#87dfce"],["Ink","#171717","#686868"]].map(([title,colour,end])=><button key={title} type="button" aria-label={`${title} gradient`} title={title} style={{background:`linear-gradient(135deg,${colour},${end})`}} onClick={()=>updateSide({background:{colour,gradient:{end,angle:135}}})}/>)}
  </div>
  <div className="customizer-layer-list">
   <label>Text layer<select aria-label={`${face} text layer`} value={layer?.id||''} onChange={e=>onSelect(e.target.value||null)}><option value="">Choose text</option>{side.text.map((t,i)=><option key={t.id} value={t.id}>{t.binding==='name'?'Your name':t.binding==='title'?'Title / motto':t.text||`Text ${i+1}`}</option>)}</select></label>
   <button type="button" className="btn btn-ghost" disabled={side.text.length>=12} onClick={()=>{const id=crypto.randomUUID();updateSide({text:[...side.text,{id,text:'Your text',x:.5,y:.25,sizeMm:4,font:'Arial',colour:'#ffffff',bold:false,rotation:0}]});onSelect(id);}}><span aria-hidden="true">+</span>Add text</button>
  </div>
  {layer&&<>
   <div className="customizer-text-fields">
    <label className="customizer-text-value">Text<input aria-label="Card text" maxLength={160} value={layer.binding==='name'?(name||layer.text):layer.binding==='title'?draft.title:layer.text} placeholder={layer.binding==='name'?'Your name':layer.binding==='title'?'Title / motto (optional)':'Your text'} onChange={e=>patch({text:e.target.value,binding:undefined})}/></label>
    <label>Font<select aria-label="Card text font" value={layer.font} onChange={e=>patch({font:e.target.value as CardText['font']})}>{CARD_FONTS.map(font=><option key={font}>{font}</option>)}</select></label>
    <label>Size · {layer.sizeMm} mm<input aria-label="Card text size" type="range" min={2} max={12} step={.01} value={layer.sizeMm} onChange={e=>patch({sizeMm:Number(e.target.value)})}/></label>
    <ColourPicker label="Card text colour" value={layer.colour} onChange={colour=>patch({colour})}/>
    <label className="flex items-center gap-2"><input type="checkbox" checked={layer.bold} onChange={e=>patch({bold:e.target.checked})}/>Bold</label>
   </div>
   <details className="customizer-position">
    <summary>Position and rotation</summary>
    <div className="customizer-text-fields">
     <label>Horizontal<input aria-label="Text horizontal position" type="range" min={.04} max={.96} step={.001} value={layer.x} onChange={e=>patch({x:Number(e.target.value)})}/></label>
     <label>Vertical<input aria-label="Text vertical position" type="range" min={.06} max={.94} step={.001} value={layer.y} onChange={e=>patch({y:Number(e.target.value)})}/></label>
     <label>Rotation · {layer.rotation||0}°<input aria-label="Text rotation" type="range" min={-180} max={180} step={1} value={layer.rotation||0} onChange={e=>patch({rotation:Number(e.target.value)})}/></label>
     <button className="btn btn-ghost" type="button" onClick={()=>patch({rotation:0})}><Icon name="refresh" size={16}/>Straighten text</button>
    </div>
    <p>Keyboard: arrows move, + / − resize, [ / ] rotate, Delete removes.</p>
   </details>
   <button className="btn btn-ghost customizer-remove" type="button" onClick={()=>{updateSide({text:side.text.filter(t=>t.id!==layer.id)});onSelect(null);}}><Icon name="trash" size={16}/>Remove text</button>
  </>}
 </div>;
}
