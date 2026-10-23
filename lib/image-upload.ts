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
