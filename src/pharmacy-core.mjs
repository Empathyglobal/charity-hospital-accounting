// Copyright (c) 2026 Eric Gonzalez-Payne. MIT License.
// PDF text is evidence, never executable markup or a posting instruction.
export function tableFromItems(pages, gap=14) {
  if(!Array.isArray(pages)||pages.length>8)throw Error('Maximum 8 pages.');
  if(!Number.isFinite(gap)||gap<3||gap>100)throw Error('Column gap must be between 3 and 100.');
  const raw=[];
  for(const [page,items] of pages.entries()) {
    if(!Array.isArray(items)||items.length>20000)throw Error('Page has too many text items.');
    for(const i of items)if(typeof i.str==='string'&&i.str.trim()&&(!Array.isArray(i.transform)||!Number.isFinite(i.transform[4])||!Number.isFinite(i.transform[5])||!Number.isFinite(i.width??0)))throw Error('Invalid text coordinates.');
    const lines=[];
    for(const item of items.filter(i=>typeof i.str==='string'&&i.str.trim()).sort((a,b)=>b.transform[5]-a.transform[5]||a.transform[4]-b.transform[4])) {
      const y=item.transform[5],x=item.transform[4];let line=lines.find(l=>Math.abs(l.y-y)<3);
      if(!line){if(raw.length+lines.length>=1000)throw Error('Maximum 1,000 extracted rows. Split the PDF.');line={y,items:[]};lines.push(line);}line.items.push({x,width:item.width||0,text:item.str});
    }
    for(const line of lines){const cells=[];for(const item of line.items.sort((a,b)=>a.x-b.x)){
      const last=cells.at(-1);if(last&&item.x-last.end<=gap){last.text+=' '+item.text;last.end=Math.max(last.end,item.x+item.width);}else cells.push({...item,end:item.x+item.width});
    }raw.push({page:page+1,cells});}
  }
  const reference=raw.reduce((a,r)=>r.cells.length>a.length?r.cells:a,[]);
  if(reference.length>20)throw Error('More than 20 detected columns. Increase column gap or split the PDF.');
  const anchors=reference.map(c=>c.x);
  const rows=raw.map(r=>{const values=Array(anchors.length).fill('');for(const c of r.cells){let col=0;for(let i=1;i<anchors.length;i++)if(c.x>=anchors[i]-5)col=i;values[col]+=(values[col]?' ':'')+c.text;}return {page:r.page,values,originalValues:[...values],included:true,reviewed:false};});
  return {headers:anchors.map((_,i)=>'Column '+(i+1)),rows};
}
export function cell(value){let s=String(value??'');if(/^[\s\u0000-\u001f]*[=+@-]/u.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
export function reviewedCsv(headers,rows){
  if(!headers.length||headers.some(h=>!String(h).trim())||new Set(headers.map(h=>h.trim().toLowerCase())).size!==headers.length)throw Error('Give each column a unique, nonblank heading.');
  const chosen=rows.filter(r=>r.included);if(!chosen.length)throw Error('Include at least one row.');if(chosen.some(r=>!r.reviewed))throw Error('Review every included row before export.');
  if(chosen.some(r=>r.values.length!==headers.length))throw Error('Column count mismatch: review the table.');
  return '\uFEFF'+[headers,...chosen.map(r=>r.values)].map(r=>r.map(cell).join(',')).join('\r\n')+'\r\n';
}
