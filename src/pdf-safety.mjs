// Copyright (c) 2026 Eric Gonzalez-Payne. MIT License.
// Run before rendering, text extraction or export. A partial check is not approval.
const hasActions=value=>value instanceof Map||value instanceof Set?value.size>0:!!value&&typeof value==='object'&&Object.keys(value).length>0;
export async function assertPassivePdf(document){
 if(!Number.isInteger(document.numPages)||document.numPages<1||document.numPages>8)throw Error('Maximum 8 pages. Split the PDF.');
 if(hasActions(await document.getJSActions())||hasActions(await document.getAttachments()))throw Error('Use a PDF without scripts or embedded attachments.');
 for(let n=1;n<=document.numPages;n++){
  const page=await document.getPage(n);
  if(hasActions(await page.getJSActions()))throw Error('Use a PDF without scripts or embedded attachments.');
  const annotations=await page.getAnnotations();
  if(annotations.length>1000)throw Error('Page has too many annotations.');
  if(annotations.some(annotation=>hasActions(annotation.actions)||annotation.file||annotation.attachment))throw Error('Use a PDF without scripts or embedded attachments.');
 }
}
