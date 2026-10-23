// Package the supplied gallery mockups without using them as printable artwork.
// The browser covers stock QR areas with the website's real demo QR.
import {readdir,mkdir,writeFile} from 'node:fs/promises';
import sharp from 'sharp';
const families={whatsapp:{folder:'watsapp',covers:[[58,33,30,34],[39,11,33,37],[10,36,38,35],[54,51,27,30]]},instagram:{folder:'instagram',covers:[[54,46,31,37],[64,51,21,20],[22,39,32,42]]},linkedin:{folder:'linkedin',covers:[[19,44,33,32],[20,42,29,32],[54,29,35,44]]},tiktok:{folder:'Tiktok',covers:[[39,61,34,23]]}};
await mkdir('public/link-card-references',{recursive:true});
const references={};
for(const [family,{folder,covers}] of Object.entries(families)){
 const files=(await readdir('assets/linkcard/'+folder)).filter(f=>f.endsWith('.png')).sort();
 for(let index=0;index<files.length;index++){
  const id=`social-${family}-${index+1}`,src=`/link-card-references/${id}.webp`,image=sharp('assets/linkcard/'+folder+'/'+files[index]),meta=await image.metadata();
  await image.resize({width:640,withoutEnlargement:true}).webp({quality:88}).toFile('public'+src);
  references[id]={src,width:meta.width,height:meta.height,cover:covers[index]};
 }
}
await writeFile('lib/data/link-card-references.json',JSON.stringify(references,null,2)+'\n');
