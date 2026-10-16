import {CARD_WIDTH_MM as W,CARD_HEIGHT_MM as H,templateFor,DEFAULT_PRINT_SETTINGS,type CardFace,type CardTemplateDefinition,type PhysicalCard,type PrintSettings} from './physical-card';
import {getPrivateUploadBlob} from './upload-service';
import {resolveCardText,rotatedTextSize,type TextBox} from './card-editor';
import {pngWithDensity} from './png-density';

export type CardRenderInput = {templateId:string;template?:CardTemplateDefinition|null;physical:PhysicalCard;name:string;title:string;face:CardFace;logoSource?:string;profileUrl?:string;frontSource?:string;backSource?:string;settings?:PrintSettings;proof?:boolean};
export type CardRenderResult = {canvas:HTMLCanvasElement;warnings:string[];textBoxes:TextBox[]};
const bitmaps = new Map<string,Promise<ImageBitmap>>();
async function bitmap(source:string) {
  if(!bitmaps.has(source))bitmaps.set(source,(async()=>{
    const blob=source.startsWith('order-artwork/')?await getPrivateUploadBlob(source):await fetch(source,{credentials:'omit'}).then(r=>{if(!r.ok)throw new Error('Card background is unavailable.');return r.blob();});
    return createImageBitmap(blob);
  })().catch(e=>{bitmaps.delete(source);throw e;}));
  return bitmaps.get(source)!;
}
// Do not cache private artwork across account changes. Call on admin/editor unmount.
export function clearCardArtworkCache(){for(const value of bitmaps.values())void value.then(image=>image.close()).catch(()=>{});bitmaps.clear();}
export async function renderCardFace(input:CardRenderInput):Promise<CardRenderResult> {
  const settings=input.settings||DEFAULT_PRINT_SETTINGS;
  if(settings.colour!=='rgb')throw new Error('This exporter produces RGB. Arrange CMYK conversion with the printer.');
  if(![300,600].includes(settings.dpi)||!Number.isFinite(settings.bleedMm)||settings.bleedMm<0||settings.bleedMm>5||settings.safeMm<2||settings.safeMm>8)throw new Error('Check the printer dimensions and resolution.');
  const template=input.template===undefined?templateFor(input.templateId,input.physical.templateVersion):input.template;
  if(input.templateId!=='upload'&&!template)throw new Error('This card template is unavailable.');
  const b=settings.bleedMm,scale=settings.dpi/25.4;
  const canvas=document.createElement('canvas');canvas.width=Math.round((W+2*b)*scale);canvas.height=Math.round((H+2*b)*scale);
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Card rendering is unavailable in this browser.');
  ctx.scale(canvas.width/(W+2*b),canvas.height/(H+2*b));ctx.fillStyle=template?.background||'#100b4a';ctx.fillRect(0,0,W+2*b,H+2*b);ctx.translate(b,b);if(input.face==='back'&&settings.orientation==='short-edge'){ctx.translate(W,H);ctx.rotate(Math.PI);}
  const warnings:string[]=[],textBoxes:TextBox[]=[];
  const editor=input.physical.editor?.[input.face];
  if(editor){const bg=editor.background;if(bg.gradient){const angle=bg.gradient.angle*Math.PI/180,dx=Math.cos(angle)*W/2,dy=Math.sin(angle)*H/2,g=ctx.createLinearGradient(W/2-dx,H/2-dy,W/2+dx,H/2+dy);g.addColorStop(0,bg.colour);g.addColorStop(1,bg.gradient.end);ctx.fillStyle=g;}else ctx.fillStyle=bg.colour;ctx.fillRect(-b,-b,W+2*b,H+2*b);}
  if(!editor&&template?.texture==='wood') {ctx.strokeStyle=template.accent;ctx.globalAlpha=.16;ctx.lineWidth=.15;for(let y=-5;y<H+5;y+=1.3){ctx.beginPath();ctx.moveTo(-b,y);ctx.bezierCurveTo(W*.3,y+1.2,W*.6,y-1.1,W+b,y+.8);ctx.stroke();}ctx.globalAlpha=1;}
  const source=input.templateId==='upload'?(input.face==='front'?input.frontSource:input.backSource||(!input.physical.standardBack?input.physical.backDesignUrl:undefined)):(input.face==='front'?template?.frontBackground:template?.backBackground);
  if(source) {
    const image=await bitmap(source);const ratio=image.width/image.height;
    const width=Math.min(W,H*ratio),height=width/ratio;
    if(input.face==='front'&&(template?.artworkMode==='texture'||template?.artworkMode==='honeycomb')){
      // Sample the original’s text-free upper texture; no sample names can enter exports.
      if(template.artworkMode==='honeycomb'){const texture=document.createElement('canvas');texture.width=image.width;texture.height=image.height;const paint=texture.getContext('2d')!;const tile=Math.floor(image.width*.22);for(let x=0;x<image.width;x+=tile)paint.drawImage(image,0,0,tile,image.height,x,0,tile,image.height);ctx.drawImage(texture,(W-width)/2,(H-height)/2,width,height);}else ctx.drawImage(image,0,0,image.width,image.height*.39,(W-width)/2,(H-height)/2,width,height);
    }else{ctx.drawImage(image,(W-width)/2,(H-height)/2,width,height);
      if(input.face==='front'&&template?.artworkMode==='studio'){
        const sample=document.createElement('canvas');sample.width=sample.height=1;const sampleContext=sample.getContext('2d')!;sampleContext.drawImage(image,image.width*.5,image.height*.3,1,1,0,0,1,1);const pixel=sampleContext.getImageData(0,0,1,1).data;ctx.fillStyle=`rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;for(const [x,y,w,h] of [[.1,.39,.8,.23],[.29,.07,.42,.08],[.29,.85,.42,.07]])ctx.fillRect((W-width)/2+width*x,(H-height)/2+height*y,width*w,height*h);
      }
      if(input.face==='front'&&template?.artworkMode==='botanical'){
        ctx.fillStyle='#ffffff';ctx.fillRect(W*.22,H*.37,W*.55,H*.24);
      }
    }
    if(Math.abs(ratio/(W/H)-1)>.005)warnings.push('Artwork proportions differ from the card. It is fitted without cropping; check the borders.');
    const effective=Math.min(image.width/W,image.height*(template?.artworkMode==='texture'?.39:1)/H)*25.4;
    if(effective<300)warnings.push('This artwork is below 300 dpi at card size. Supply a larger original before printing.');
    if(b>0)warnings.push('Uploaded artwork covers the trim area; check the extended background in the bleed with your printer.');
  } else if(input.templateId==='upload'&&input.face==='front')throw new Error('Choose front artwork first.');
  if(!editor&&input.templateId!=='upload') {
    if(!template!.artworkMode){ctx.strokeStyle=template!.accent;ctx.lineWidth=.2;ctx.strokeRect(3,3,W-6,H-6);}
    const text=(value:string,slot:CardTemplateDefinition['nameSlot'],font:string)=>{
      if(!value)return;let size=slot.size;ctx.font=`${size}px ${font}`;
      while(size>2.4&&ctx.measureText(value).width>Math.min(W*slot.width,W-2*settings.safeMm)){size-=.1;ctx.font=`${size}px ${font}`;}
      if(ctx.measureText(value).width>Math.min(W*slot.width,W-2*settings.safeMm))throw new Error('Printed wording is too long for this design. Use a shorter name or title.');
      ctx.fillStyle=template!.ink;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(value,W*slot.x,H*slot.y);
    };
    if(input.face==='back'){ctx.fillStyle=template!.ink;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 3px Arial';ctx.fillText('EdgeTap',W/2,H*.86);}
    if(input.face==='front'){text(input.name||'Your name',template!.nameSlot,template!.font);text(input.title,template!.titleSlot,'Arial');}
  }
  if(editor){for(const t of editor.text){
    const value=resolveCardText(t,input.name,input.title);if(!value)continue;
    ctx.font=`${t.bold?'bold ':''}${t.sizeMm}px "${t.font}"`;
    const measured=ctx.measureText(value),width=Math.max(measured.width,t.sizeMm*.6),height=t.sizeMm*1.25;
    const box={id:t.id,widthMm:width,heightMm:height,sizeMm:t.sizeMm};textBoxes.push(box);
    const rotation=t.rotation||0,extent=rotatedTextSize(width,height,rotation),x=t.x*W,y=t.y*H;
    if(extent.width/2>Math.min(x-settings.safeMm,W-settings.safeMm-x)+.02||extent.height/2>Math.min(y-settings.safeMm,H-settings.safeMm-y)+.02){
      warnings.push('Text reaches outside the safe area. Move it inward or reduce its size.');
      if(input.proof===false)throw new Error('Move text inside the print safe area or reduce its size.');
    }
    ctx.save();ctx.translate(x,y);ctx.rotate(rotation*Math.PI/180);ctx.fillStyle=t.colour;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(value,0,0);ctx.restore();
  }}
  const logoSource=input.logoSource||input.physical.logoUrl;
  if(logoSource&&input.face==='front'){
    const logo=await bitmap(logoSource),maxW=18,maxH=8,scale=Math.min(maxW/logo.width,maxH/logo.height),w=logo.width*scale,h=logo.height*scale;
    ctx.drawImage(logo,(W-w)/2,7+(maxH-h)/2,w,h);
  }
  const q=input.physical.qr;
  if(!editor&&!source&&input.face==='back'&&(!q.enabled||q.face!=='back')){ctx.fillStyle=template?.ink||'#faf8f0';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='3.5px Arial';ctx.fillText('Tap to connect',W/2,H/2);}
  if(q.enabled&&q.face===input.face){if(q.x*W-q.sizeMm/2<settings.safeMm||q.x*W+q.sizeMm/2>W-settings.safeMm||q.y*H-q.sizeMm/2<settings.safeMm||q.y*H+q.sizeMm/2>H-settings.safeMm)throw new Error('Move the QR inside the printer safe area.');const size=q.sizeMm,x=q.x*W-size/2,y=q.y*H-size/2;
    ctx.fillStyle='#ffffff';ctx.fillRect(x,y,size,size);
    if(input.profileUrl){const QRCode=(await import('qrcode')).default;const qr=document.createElement('canvas');await QRCode.toCanvas(qr,input.profileUrl,{width:Math.round(size*scale),margin:4,errorCorrectionLevel:'M',color:{dark:'#000000',light:'#ffffff'}});ctx.imageSmoothingEnabled=false;ctx.drawImage(qr,x,y,size,size);ctx.imageSmoothingEnabled=true;}
    else{ctx.strokeStyle='#100b4a';ctx.lineWidth=.5;ctx.setLineDash([1,1]);ctx.strokeRect(x+.8,y+.8,size-1.6,size-1.6);ctx.setLineDash([]);ctx.fillStyle='#100b4a';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='3px Arial';ctx.fillText('QR',x+size/2,y+size/2);}
  }
  if(input.proof){ctx.save();ctx.translate(W/2,H/2);ctx.rotate(-.3);ctx.fillStyle='rgba(180,30,30,.28)';ctx.font='bold 10px Arial';ctx.textAlign='center';ctx.fillText('DRAFT · DO NOT PRINT',0,0);ctx.restore();}
  return {canvas,warnings,textBoxes};
}
export function canvasPng(canvas:HTMLCanvasElement):Promise<Blob>{return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG export failed.')),'image/png'));}
export async function renderPrintFiles(input:Omit<CardRenderInput,'face'>) {
  const [front,back]=await Promise.all(['front','back'].map(face=>renderCardFace({...input,face:face as CardFace})));
  const settings=input.settings||DEFAULT_PRINT_SETTINGS;
  const [frontPng,backPng]=await Promise.all([front,back].map(async face=>pngWithDensity(await canvasPng(face.canvas),settings.dpi)));
  const {PDFDocument}=await import('pdf-lib');const pdf=await PDFDocument.create(),s=input.settings||DEFAULT_PRINT_SETTINGS,b=s.bleedMm,pt=72/25.4;
  pdf.setTitle(input.proof?'EdgeTap draft proof':'EdgeTap card artwork');pdf.setCreator('EdgeTap');
  for(const blob of [frontPng,backPng]){const page=pdf.addPage([(W+2*b)*pt,(H+2*b)*pt]);page.drawImage(await pdf.embedPng(await blob.arrayBuffer()),{x:0,y:0,width:(W+2*b)*pt,height:(H+2*b)*pt});page.setTrimBox(b*pt,b*pt,W*pt,H*pt);page.setBleedBox(0,0,(W+2*b)*pt,(H+2*b)*pt);}
  return {front:frontPng,back:backPng,pdf:new Blob([new Uint8Array(await pdf.save())],{type:'application/pdf'}),warnings:[...new Set([...front.warnings,...back.warnings])]};
}
export function downloadCardFile(blob:Blob,name:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);}
