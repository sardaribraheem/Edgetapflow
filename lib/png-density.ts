// Canvas encodes PNG density as 96 dpi. Set the real export density without
// changing pixels so printer software reads the intended physical dimensions.
export async function pngWithDensity(blob:Blob,dpi:number):Promise<Blob>{
 const bytes=new Uint8Array(await blob.arrayBuffer()),pieces:Uint8Array[]=[bytes.slice(0,8)];
 const chunk=new Uint8Array(21),view=new DataView(chunk.buffer);view.setUint32(0,9);chunk.set([112,72,89,115],4);const metres=Math.round(dpi/25.4*1000);view.setUint32(8,metres);view.setUint32(12,metres);chunk[16]=1;
 let crc=0xffffffff;for(const byte of chunk.subarray(4,17)){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}view.setUint32(17,(crc^0xffffffff)>>>0);
 let inserted=false;for(let offset=8;offset<bytes.length;){const length=new DataView(bytes.buffer,bytes.byteOffset+offset,4).getUint32(0),end=offset+length+12;if(end>bytes.length)throw new Error('Invalid PNG export.');const type=String.fromCharCode(...bytes.subarray(offset+4,offset+8));if(!inserted&&type==='IDAT'){pieces.push(chunk);inserted=true;}if(type!=='pHYs')pieces.push(bytes.slice(offset,end));offset=end;}
 return new Blob(pieces.map(piece=>new Uint8Array(piece)),{type:'image/png'});
}
