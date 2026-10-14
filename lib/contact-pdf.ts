import type { Profile } from './data/profile';
import { isSafeContactUrl } from './links';
import { APP_URL, profileUrl } from './site';

// Browser fonts preserve Unicode names. Embedded high-resolution pages have
// real PDF URI annotations, including mailto/tel; no server receives this data.
export async function contactPdf(profile:Profile):Promise<Uint8Array> {
  const {PDFDocument,PDFString}=await import('pdf-lib');
  const pdf=await PDFDocument.create();pdf.setTitle(profile.displayName+' · Contact');pdf.setAuthor(profile.displayName);pdf.setCreator('EdgeTap');
  const width=595.28,height=841.89,margin=44,ink='#100B4A',soft='#625d73';
  const bodyFont=getComputedStyle(document.body).fontFamily;
  const displayFont=getComputedStyle(document.documentElement).getPropertyValue('--font-display')||bodyFont;
  type Annotation={url:string;x:number;y:number;w:number;h:number};
  const sheets:{canvas:HTMLCanvasElement;links:Annotation[]}[]=[];
  let canvas!:HTMLCanvasElement,ctx!:CanvasRenderingContext2D,links!:Annotation[];let y=0;
  const sheet=()=>{
    canvas=document.createElement('canvas');canvas.width=Math.ceil(width*2);canvas.height=Math.ceil(height*2);
    const context=canvas.getContext('2d');if(!context)throw new Error('PDF rendering unavailable.');ctx=context;ctx.scale(2,2);
    ctx.fillStyle='#FAF8F0';ctx.fillRect(0,0,width,height);links=[];sheets.push({canvas,links});y=margin;
  };
  const font=(size:number,bold=false)=>{ctx.font=`${bold?'700':'400'} ${size}px ${bold?displayFont:bodyFont}`;ctx.fillStyle=ink;ctx.textBaseline='top';};
  const round=(x:number,top:number,w:number,h:number,r=12)=>{ctx.beginPath();ctx.roundRect(x,top,w,h,r);ctx.fill();};
  const footer=()=>{
    ctx.fillStyle='#ddd9e6';ctx.fillRect(margin,height-57,width-margin*2,1);
    font(10,true);ctx.fillText('Powered by EdgeTap',margin,height-39);
    font(9);ctx.fillStyle=soft;ctx.textAlign='right';ctx.fillText(profileUrl(profile.username).replace(/^https?:\/\//,''),width-margin,height-39);ctx.textAlign='left';
    links.push({url:APP_URL,x:margin,y:height-46,w:150,h:28},{url:profileUrl(profile.username),x:width/2,y:height-46,w:width/2-margin,h:28});
  };
  const nextPage=()=>{footer();sheet();font(20,true);ctx.fillText(profile.displayName,margin,y);y+=36;};
  const room=(space:number)=>{if(y+space>height-80)nextPage();};
  const text=(value:string,size:number,lineHeight:number,maxWidth=width-margin*2,bold=false)=>{
    font(size,bold);
    for(const paragraph of value.split(/\r?\n/)){
      let line='';
      for(const character of Array.from(paragraph)){
        if(line&&ctx.measureText(line+character).width>maxWidth){room(lineHeight);font(size,bold);ctx.fillText(line.trimEnd(),margin,y);y+=lineHeight;line='';}
        line+=character;
      }
      room(lineHeight);font(size,bold);ctx.fillText(line.trimEnd(),margin,y);y+=lineHeight;
    }
  };
  const image=async()=>{
    if(!profile.avatar)return null;
    try{
      const response=await fetch(profile.avatar,{credentials:'omit',signal:AbortSignal.timeout(7000)});
      if(!response.ok)return null;const blob=await response.blob();if(blob.size>5*1024*1024)return null;
      return await createImageBitmap(blob);
    }catch{return null;}
  };
  await document.fonts.ready;const portrait=await image();sheet();
  ctx.fillStyle='#e7e8ed';round(margin,y,86,86,43);ctx.save();ctx.beginPath();ctx.arc(margin+43,y+43,43,0,Math.PI*2);ctx.clip();
  if(portrait){const size=Math.min(portrait.width,portrait.height);ctx.drawImage(portrait,(portrait.width-size)/2,(portrait.height-size)/2,size,size,margin,y,86,86);portrait.close();}
  else{ctx.fillStyle='#9299a7';ctx.beginPath();ctx.arc(margin+43,y+31,14,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(margin+43,y+79,30,29,0,0,Math.PI*2);ctx.fill();}ctx.restore();
  font(11,true);ctx.fillStyle=soft;ctx.fillText('CONTACT CARD',margin+106,y+10);font(12);ctx.fillText('/u/'+profile.username,margin+106,y+33);
  ctx.fillStyle='#F6D54D';round(width-margin-48,y+14,48,48,24);font(23,true);ctx.textAlign='center';ctx.fillText('↗',width-margin-24,y+23);ctx.textAlign='left';
  links.push({url:profileUrl(profile.username),x:width-margin-48,y:y+14,w:48,h:48});y+=113;
  text(profile.displayName,32,40,undefined,true);
  if(profile.title){y+=5;text(profile.title,15,22);}
  if(profile.location){y+=8;text(profile.location,11,17);}
  if(profile.bio){y+=15;text(profile.bio,12,19);y+=8;}
  y+=16;
  for(const link of profile.links.filter(link=>isSafeContactUrl(link.url))){
    room(74);ctx.fillStyle='#ffffff';round(margin,y,width-margin*2,62);
    font(14,true);let label=link.label;while(label&&ctx.measureText(label).width>width-margin*2-62)label=label.slice(0,-1);ctx.fillText(label+(label.length<link.label.length?'…':''),margin+18,y+13);
    font(10);ctx.fillStyle=soft;
    const url=new URL(link.url).href,display=url.replace(/^(?:https?:\/\/|mailto:|tel:)/,'');let short=display;
    while(short&&ctx.measureText(short).width>width-margin*2-62)short=short.slice(0,-1);
    ctx.fillText(short+(short.length<display.length?'…':''),margin+18,y+35);
    font(16,true);ctx.fillText('↗',width-margin-30,y+20);
    links.push({url,x:margin,y,w:width-margin*2,h:62});y+=74;
  }
  footer();
  for(const sheet of sheets){
    const bytes=Uint8Array.from(atob(sheet.canvas.toDataURL('image/png').split(',')[1]),character=>character.charCodeAt(0));
    const page=pdf.addPage([width,height]);page.drawImage(await pdf.embedPng(bytes),{x:0,y:0,width,height});
    for(const link of sheet.links){const annotation=pdf.context.obj({Type:'Annot',Subtype:'Link',Rect:[link.x,height-link.y-link.h,link.x+link.w,height-link.y],Border:[0,0,0],A:{Type:'Action',S:'URI',URI:PDFString.of(link.url)}});page.node.addAnnot(pdf.context.register(annotation));}
  }
  return pdf.save();
}
