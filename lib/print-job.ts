import { PDFDocument } from 'pdf-lib';
export async function printJobPdf(orderName: string, orderNumber: string, front: Blob, back: Blob): Promise<Blob> {
  const canvas=document.createElement('canvas');canvas.width=1240;canvas.height=1754;
  const context=canvas.getContext('2d');if(!context)throw new Error('Printing is unavailable in this browser.');
  context.fillStyle='#ffffff';context.fillRect(0,0,canvas.width,canvas.height);
  context.fillStyle='#100b4a';context.font='bold 38px Arial';context.fillText(orderName,80,100,1080);context.font='24px Arial';context.fillText(orderNumber,80,145,1080);
  for(const [index,blob] of [front,back].entries()) { const image=await createImageBitmap(blob);try {const width=980,height=width*image.height/image.width;const y=220+index*730;context.font='bold 24px Arial';context.fillText(index===0?'Front':'Back',130,y);context.drawImage(image,130,y+30,width,height);}finally{image.close();} }
  const bytes=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Could not create print order.')),'image/png'));
  const pdf=await PDFDocument.create(),page=pdf.addPage([595.28,841.89]),image=await pdf.embedPng(await bytes.arrayBuffer());page.drawImage(image,{x:0,y:0,width:595.28,height:841.89});
  return new Blob([new Uint8Array(await pdf.save()).buffer],{type:'application/pdf'});
}
