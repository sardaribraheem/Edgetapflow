import {CARD_WIDTH_MM as W,CARD_HEIGHT_MM as H,type CardText} from './physical-card';

export type TextBox = {id:string;widthMm:number;heightMm:number;sizeMm:number};
export const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
export function normaliseRotation(degrees:number){return ((degrees+180)%360+360)%360-180;}
export function resolveCardText(layer:CardText,name:string,title:string){
 return layer.binding==='name'?(name||'Your name'):layer.binding==='title'?title:layer.text;
}
export function rotatedTextSize(width:number,height:number,rotation=0){
 const angle=rotation*Math.PI/180,c=Math.abs(Math.cos(angle)),s=Math.abs(Math.sin(angle));
 return {width:width*c+height*s,height:width*s+height*c};
}
// Uses the same measured box in the pointer editor and the print renderer.
export function constrainText(layer:CardText,box:TextBox,patch:Partial<CardText>,safeMm=3):CardText {
 const next={...layer,...patch},rotation=normaliseRotation(next.rotation||0);
 let sizeMm=clamp(next.sizeMm,2,12);
 let extent=rotatedTextSize(box.widthMm*sizeMm/box.sizeMm,box.heightMm*sizeMm/box.sizeMm,rotation);
 const fit=Math.min(1,(W-safeMm*2)/Math.max(.01,extent.width),(H-safeMm*2)/Math.max(.01,extent.height));
 sizeMm=Math.max(2,sizeMm*fit);
 extent=rotatedTextSize(box.widthMm*sizeMm/box.sizeMm,box.heightMm*sizeMm/box.sizeMm,rotation);
 const halfX=Math.min(W/2,Math.max(W*.04,safeMm+extent.width/2));
 const halfY=Math.min(H/2,Math.max(H*.06,safeMm+extent.height/2));
 return {...next,rotation,sizeMm:Math.round(sizeMm*100)/100,x:clamp(next.x,halfX/W,1-halfX/W),y:clamp(next.y,halfY/H,1-halfY/H)};
}
export function cardPoint(clientX:number,clientY:number,rect:{left:number;top:number;width:number;height:number},bleedMm=0,flipped=false){
 let x=((clientX-rect.left)/rect.width*(W+2*bleedMm)-bleedMm)/W;
 let y=((clientY-rect.top)/rect.height*(H+2*bleedMm)-bleedMm)/H;
 if(flipped){x=1-x;y=1-y;}return {x,y};
}
