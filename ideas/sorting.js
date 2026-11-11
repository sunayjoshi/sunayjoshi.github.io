// Sort only the currently selected category/search results; keep unrated ideas last.
export function sortIdeas(ideas, mode, query='') {
 const value=row=>mode==='product'
  ? (Number.isFinite(row.F)&&Number.isFinite(row.I)?Math.round(row.F*10)*Math.round(row.I*10):null)
  : (Number.isFinite(row[mode==='impact'?'I':'F'])?Math.round(row[mode==='impact'?'I':'F']*10):null);
 if(['feasibility','impact','product'].includes(mode))return [...ideas].sort((a,b)=>{
  const x=value(a),y=value(b);
  if(x===null&&y!==null)return 1;if(y===null&&x!==null)return -1;
  return (y??0)-(x??0)||a.order-b.order;
 });
 return mode==='document'||!query.trim()?[...ideas].sort((a,b)=>a.order-b.order):[...ideas];
}
