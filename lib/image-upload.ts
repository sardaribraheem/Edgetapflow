export const IMAGE_FORMATS = 'JPEG, PNG or WebP';

// Check actual image bytes as well as type. Some phone file pickers omit MIME.
export async function prepareImageUpload(file:File,maxMb:number):Promise<File> {
  if(file.size<=0)throw new Error('This image is empty. Choose another photo.');
  if(file.size>maxMb*1024*1024)throw new Error(`Choose an image up to ${maxMb} MB. This file is ${(file.size/1024/1024).toFixed(1)} MB.`);
  const bytes=new Uint8Array(await file.slice(0,16).arrayBuffer());
  const type=bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff?'image/jpeg':bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47?'image/png':String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP'?'image/webp':'';
  if(!type)throw new Error(`Choose a ${IMAGE_FORMATS} image. If this is a HEIC photo, export it as JPEG first.`);
  const image=file.type===type?file:new File([file],file.name,{type,lastModified:file.lastModified});
  if(typeof Image!=='undefined'){
    const url=URL.createObjectURL(image);
    try {const preview=new Image();preview.src=url;await preview.decode();if(!preview.naturalWidth||!preview.naturalHeight)throw new Error('Invalid dimensions');}
    catch {throw new Error('This image could not be opened. Export a new JPEG or PNG and try again.');}
    finally {URL.revokeObjectURL(url);}
  }
  return image;
}

export type PublicImagePurpose='portrait'|'logo'|'gallery';
export const PUBLIC_IMAGE_LIMITS={portrait:{edge:640,bytes:150*1024},logo:{edge:320,bytes:50*1024},gallery:{edge:1600,bytes:250*1024}} as const;
// Only new public images pass through this path. Private print masters/receipts
// retain their original bytes and quality; existing cloud images are untouched.
export async function compressPublicImage(file:File,purpose:PublicImagePurpose='portrait'):Promise<File>{
 const source=await prepareImageUpload(file,purpose==='gallery'?10:5),limit=PUBLIC_IMAGE_LIMITS[purpose];
 if(typeof document==='undefined'||typeof Image==='undefined')throw new Error('Photo processing is unavailable. Use a current browser and retry.');
 const url=URL.createObjectURL(source),image=new Image();
 try{
  image.src=url;await image.decode();
  const width=image.naturalWidth,height=image.naturalHeight;
  if(width*height>64000000||width>16000||height>16000)throw new Error('This image has too many pixels. Export a smaller photo and retry.');
  // Always re-encode gallery photos so uploaded files do not retain source EXIF/GPS metadata.
  if(purpose!=='gallery'&&Math.max(width,height)<=limit.edge&&source.size<=limit.bytes)return source;
  let edge:number=limit.edge;
  for(let attempt=0;attempt<9;attempt++){
   const ratio=Math.min(1,edge/Math.max(width,height)),canvas=document.createElement('canvas');
   canvas.width=Math.max(1,Math.round(width*ratio));canvas.height=Math.max(1,Math.round(height*ratio));
   const context=canvas.getContext('2d');if(!context)throw new Error('Photo processing is unavailable. Reload and retry.');
   context.drawImage(image,0,0,canvas.width,canvas.height);
   const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Could not prepare this photo. Try a new JPEG or PNG.')),'image/webp',Math.max(.55,.88-attempt*.05)));
   canvas.width=0;canvas.height=0;
   if(blob.size>0&&blob.size<=limit.bytes){const ext=blob.type==='image/webp'?'webp':blob.type==='image/png'?'png':'jpg';return new File([blob],`edgetap-${purpose}.${ext}`,{type:blob.type,lastModified:source.lastModified});}
   edge=Math.max(96,Math.floor(edge*.78));
  }
  throw new Error('This photo could not fit the public image limit. Choose a simpler or smaller image.');
 }finally{URL.revokeObjectURL(url);}
}
