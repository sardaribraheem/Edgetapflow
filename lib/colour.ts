export type Hsv={h:number;s:number;v:number};
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
export function hexToRgb(hex:string){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)) as [number,number,number];}
export function rgbToHex(r:number,g:number,b:number){return '#'+[r,g,b].map(c=>Math.round(clamp(c,0,255)).toString(16).padStart(2,'0')).join('');}
export function hexToHsv(hex:string):Hsv{
 const [r,g,b]=hexToRgb(hex).map(c=>c/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
 let h=0;if(d){if(max===r)h=((g-b)/d)%6;else if(max===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360;}
 return {h,s:max?d/max:0,v:max};
}
export function hsvToHex({h,s,v}:Hsv){
 h=((h%360)+360)%360;s=clamp(s,0,1);v=clamp(v,0,1);
 const c=v*s,x=c*(1-Math.abs(h/60%2-1)),m=v-c;
 const rgb=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
 return rgbToHex(...rgb.map(n=>(n+m)*255) as [number,number,number]);
}
