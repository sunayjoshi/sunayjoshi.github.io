// Compare the published tenths, not binary floating-point approximations.
const tenths=value=>Math.round(value*10);
export function scoredRows(rows){return rows.filter(row=>typeof row.F==='number'&&Number.isFinite(row.F)&&typeof row.I==='number'&&Number.isFinite(row.I));}
export function paretoIds(rows){
  const scored=scoredRows(rows);
  return new Set(scored.filter(a=>!scored.some(b=>tenths(b.F)>=tenths(a.F)&&tenths(b.I)>=tenths(a.I)&&(tenths(b.F)>tenths(a.F)||tenths(b.I)>tenths(a.I)))).map(row=>row.id));
}
export function coordinateGroups(rows){
  const groups=new Map();
  for(const row of scoredRows(rows)){
    const key=`${tenths(row.F)}:${tenths(row.I)}`;
    if(!groups.has(key))groups.set(key,{key,F:tenths(row.F)/10,I:tenths(row.I)/10,rows:[]});
    groups.get(key).rows.push(row);
  }
  return [...groups.values()].sort((a,b)=>a.F-b.F||a.I-b.I);
}
// Pointer hit testing is geometric. Overlapping SVG targets must not decide
// which score pair is selected merely by their drawing order.
export function nearestPoint(points,x,y,maxDistance=18){
  let best=null,bestSquared=maxDistance*maxDistance;
  for(const point of points){
    const distance=(point.x-x)**2+(point.y-y)**2;
    if(distance<=bestSquared&&(best===null||distance<bestSquared)){best=point;bestSquared=distance;}
  }
  return best;
}
// Fitted bounds use all scored ideas, so search never changes the scale.
export function scoreDomains(rows,fullScale=false){
  const scored=scoredRows(rows);
  if(fullScale||!scored.length)return {F:[1,5],I:[1,5]};
  const domain=key=>{
    const values=scored.map(row=>tenths(row[key])/10),min=Math.min(...values),max=Math.max(...values),padding=Math.max(.2,(max-min)*.06);
    let low=Math.max(1,Math.floor((min-padding+1e-9)*10)/10),high=Math.min(5,Math.ceil((max+padding-1e-9)*10)/10);
    if(high-low<1){const mid=(low+high)/2;low=Math.max(1,mid-.5);high=Math.min(5,low+1);low=Math.max(1,high-1);}
    return [Math.round(low*10)/10,Math.round(high*10)/10];
  };
  return {F:domain('F'),I:domain('I')};
}
export function axisTicks([low,high]){
  const step=high-low<=1.5?.25:.5,ticks=[low];
  for(let v=Math.ceil((low+1e-9)/step)*step;v<high-1e-9;v+=step)if(v-low>=step*.55&&high-v>=step*.55)ticks.push(Math.round(v*100)/100);
  ticks.push(high);return [...new Set(ticks)];
}
const NS='http://www.w3.org/2000/svg';
function svgNode(name,attrs={},text){const node=document.createElementNS(NS,name);for(const [k,v]of Object.entries(attrs))node.setAttribute(k,String(v));if(text!==undefined)node.textContent=text;return node;}
function htmlNode(name,className,text){const node=document.createElement(name);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
let instanceCount=0;

/**
 * Mount once after loading all canonical rows.
 * update(filteredRows) changes search highlights while preserving the GLOBAL frontier.
 * onOpen(id) should reveal that idea in the existing list, clearing filters if needed.
 */
export function mountPareto(container,{rows,onOpen=()=>{}}){
  const all=scoredRows(rows),frontier=paretoIds(all),groups=coordinateGroups(all);
  let visible=new Set(rows.map(r=>r.id)),pinned=null,selected=null,width=0,destroyed=false,geometry=[],fullScale=false;
  const uid=`pareto-${++instanceCount}`;
  container.classList.add('pareto-view');
  const top=htmlNode('div','pareto-top');
  const summary=htmlNode('p','pareto-count');summary.setAttribute('aria-live','polite');
  const scaleControls=htmlNode('div','pareto-scale-controls');scaleControls.setAttribute('role','group');scaleControls.setAttribute('aria-label','Plot scale');
  const fitButton=htmlNode('button','','Fit scores'),fullButton=htmlNode('button','','Full 1–5');
  for(const button of [fitButton,fullButton])button.type='button';
  fitButton.setAttribute('aria-pressed','true');fullButton.setAttribute('aria-pressed','false');
  fitButton.addEventListener('click',()=>setScale(false));fullButton.addEventListener('click',()=>setScale(true));
  scaleControls.append(fitButton,fullButton);top.append(summary,scaleControls);
  const legend=htmlNode('div','pareto-legend');
  for(const [cls,label]of [['frontier','Pareto-optimal'],['ordinary','Other ideas'],['dim','Outside current view']]){const item=htmlNode('span','pareto-legend-item');item.append(htmlNode('i',cls),document.createTextNode(label));legend.append(item);}
  const chart=htmlNode('div','pareto-chart');
  const svg=svgNode('svg',{'aria-labelledby':`${uid}-title ${uid}-description`,role:'group',class:'pareto-svg'});
  const ranges=htmlNode('p','pareto-axis-ranges');chart.append(svg,ranges);
  const panel=htmlNode('section','pareto-selection');panel.setAttribute('aria-label','Selected score point');
  const workspace=htmlNode('div','pareto-workspace');workspace.append(chart,panel);
  const notice=htmlNode('p','pareto-note','Hover or tap to inspect; click to keep a selection. Numbers mark exact score ties. The dashed line joins observed frontier points. N/A entries are omitted. Small decimal differences are uncertain judgments.');
  container.replaceChildren(top,legend,workspace,notice);

  function ideaList(ideas,showScores=false){
    const list=htmlNode('ul','pareto-point-list');
    for(const row of ideas){
      const li=htmlNode('li'),button=htmlNode('button','pareto-open');button.type='button';
      const identity=htmlNode('span','pareto-open-meta');identity.append(htmlNode('span','pareto-open-id',row.id));
      if(showScores)identity.append(htmlNode('span','pareto-open-scores',`F ${row.F.toFixed(1)} · I ${row.I.toFixed(1)}`));
      button.append(identity,htmlNode('span','pareto-open-title',row.title));
      if(!visible.has(row.id))button.append(htmlNode('span','pareto-outside','Outside current view'));
      button.setAttribute('aria-label',`Open ${row.id}: ${row.title}`);button.addEventListener('click',()=>onOpen(row.id));li.append(button);list.append(li);
    }
    return list;
  }

  function showGroup(group,pin=false){
    if(pin)pinned=group.key;
    selected=group.key;
    for(const node of svg.querySelectorAll('[data-point]'))node.classList.toggle('selected',node.dataset.point===group.key);
    const head=htmlNode('div','pareto-selection-head');
    const title=htmlNode('h3','','Selected point');
    const clear=htmlNode('button','pareto-clear','Clear selection');clear.type='button';clear.addEventListener('click',()=>{pinned=null;selected=null;resetPanel();for(const node of svg.querySelectorAll('.selected'))node.classList.remove('selected');});
    head.append(title,clear);
    const isFrontier=frontier.has(group.rows[0].id),scores=htmlNode('div','pareto-selection-scores');
    for(const [label,value]of [['Feasibility',group.F],['Impact',group.I]]){const score=htmlNode('div');score.append(htmlNode('span','',label),htmlNode('strong','',value.toFixed(1)));scores.append(score);}
    const badge=htmlNode('span',`pareto-status-badge${isFrontier?' optimal':''}`,isFrontier?'Pareto-optimal':'Not on the frontier');
    const status=htmlNode('p','pareto-selection-status',`${group.rows.length} ${group.rows.length===1?'idea':'ideas'} at these scores. ${isFrontier?'No other scored idea is higher on one axis without losing on the other.':'At least one other idea scores as high on both axes and higher on one.'}`);
    panel.replaceChildren(head,scores,badge,status,ideaList(group.rows));
  }
  function resetPanel(){
    const optimal=all.filter(row=>frontier.has(row.id)).sort((a,b)=>b.F-a.F||b.I-a.I);
    panel.replaceChildren(htmlNode('h3','','Pareto frontier'),htmlNode('p','pareto-selection-status',`${optimal.length} ideas across the full dataset. Select a point to inspect it, or open an idea below.`),ideaList(optimal,true));
  }
  resetPanel();

  function pointerGroup(event){
    const matrix=svg.getScreenCTM();
    if(!matrix)return null;
    // Work in CSS screen pixels so hit areas remain usable when the SVG is
    // responsive, scaled, scrolled or displayed inside the mobile layout.
    const screenPoints=geometry.map(point=>({group:point.group,
      x:matrix.a*point.x+matrix.c*point.y+matrix.e,
      y:matrix.b*point.x+matrix.d*point.y+matrix.f}));
    return nearestPoint(screenPoints,event.clientX,event.clientY,event.pointerType==='touch'?24:18)?.group||null;
  }
  svg.addEventListener('pointermove',event=>{
    const group=pointerGroup(event);
    svg.style.cursor=group?'pointer':'';
    if(group&&!pinned&&selected!==group.key)showGroup(group);
  });
  svg.addEventListener('click',event=>{
    // Keyboard/assistive clicks have no meaningful pointer coordinates.
    const key=event.target.closest?.('[data-point]')?.dataset.point;
    const group=event.detail===0&&key?groups.find(g=>g.key===key):pointerGroup(event);
    if(!group)return;
    const point=[...svg.querySelectorAll('[data-point]')].find(node=>node.dataset.point===group.key);
    point?.focus({preventScroll:true});
    showGroup(group,true);
  });

  function draw(){
    if(destroyed)return;
    const measured=chart.getBoundingClientRect().width;
    width=Math.max(280,Math.round(measured||760));
    const mobile=width<500,h=Math.round(mobile?Math.max(390,width*1.04):Math.min(760,width*.99)),left=mobile?51:66,right=mobile?18:28,topY=30,bottom=mobile?57:66;
    const domains=scoreDomains(all,fullScale),[fLow,fHigh]=domains.F,[iLow,iHigh]=domains.I;
    const x=f=>left+(f-fLow)/(fHigh-fLow)*(width-left-right),y=i=>h-bottom-(i-iLow)/(iHigh-iLow)*(h-topY-bottom);
    geometry=groups.map(group=>({group,x:x(group.F),y:y(group.I)}));
    svg.setAttribute('viewBox',`0 0 ${width} ${h}`);svg.setAttribute('height',String(h));
    const title=svgNode('title',{id:`${uid}-title`},'Research ideas by feasibility and impact');
    const description=svgNode('desc',{id:`${uid}-description`},`Feasibility axis ${fLow} to ${fHigh}; impact axis ${iLow} to ${iHigh}; higher is better. ${all.length} scored ideas, ${frontier.size} Pareto-optimal. Keyboard focus and Enter select a point. Coincident ideas share one marker and can all be opened from its detail list.`);
    const parts=[title,description];
    parts.push(svgNode('rect',{x:left,y:topY,width:width-left-right,height:h-topY-bottom,class:'pareto-plot-background'}));
    for(const tick of axisTicks(domains.F)){
      parts.push(svgNode('line',{x1:x(tick),x2:x(tick),y1:y(iLow),y2:y(iHigh),class:'pareto-grid'}));
      parts.push(svgNode('text',{x:x(tick),y:h-bottom+25,'text-anchor':'middle',class:'pareto-tick'},String(tick)));
    }
    for(const tick of axisTicks(domains.I)){
      parts.push(svgNode('line',{x1:x(fLow),x2:x(fHigh),y1:y(tick),y2:y(tick),class:'pareto-grid'}));
      parts.push(svgNode('text',{x:left-13,y:y(tick)+4,'text-anchor':'end',class:'pareto-tick'},String(tick)));
    }
    parts.push(svgNode('text',{x:(x(fLow)+x(fHigh))/2,y:h-12,'text-anchor':'middle',class:'pareto-axis-label'},'Feasibility'));
    parts.push(svgNode('text',{transform:`translate(15 ${(y(iLow)+y(iHigh))/2}) rotate(-90)`,'text-anchor':'middle',class:'pareto-axis-label'},'Impact'));
    const frontierGroups=groups.filter(g=>frontier.has(g.rows[0].id));
    if(frontierGroups.length>1)parts.push(svgNode('polyline',{points:frontierGroups.map(g=>`${x(g.F)},${y(g.I)}`).join(' '),class:'pareto-frontier-line','aria-hidden':'true'}));
    // Large groups are drawn first, making smaller neighboring points easier to select.
    for(const group of [...groups].sort((a,b)=>b.rows.length-a.rows.length)){
      const isFrontier=frontier.has(group.rows[0].id),matches=group.rows.filter(r=>visible.has(r.id)).length;
      const count=group.rows.length,r=count===1?5.2:Math.min(13,7.5+Math.log2(count));
      const label=`Feasibility ${group.F.toFixed(1)}, impact ${group.I.toFixed(1)}; ${count} ${count===1?'idea':'ideas'}${isFrontier?'; Pareto-optimal':''}${matches!==count?`; ${matches} match current view`:''}. ${count===1?group.rows[0].id+': '+group.rows[0].title:'Select to inspect all ideas.'}`;
      const point=svgNode('g',{transform:`translate(${x(group.F)} ${y(group.I)})`,class:`pareto-point${isFrontier?' frontier':''}${matches===0?' dim':''}${selected===group.key?' selected':''}`,'data-point':group.key,role:'button',tabindex:'0','aria-label':label});
      point.append(svgNode('circle',{r:Math.max(11,r+3),class:'pareto-hit'}));
      if(isFrontier)point.append(svgNode('circle',{r:r+4,class:'pareto-halo','aria-hidden':'true'}));
      point.append(svgNode('circle',{r,class:'pareto-dot'}));
      if(count>1)point.append(svgNode('text',{'text-anchor':'middle',dy:3.6,class:'pareto-marker-count','aria-hidden':'true'},String(count)));
      point.addEventListener('focus',()=>{pinned=null;showGroup(group);});
      point.addEventListener('keydown',event=>{
        if(event.key==='Enter'||event.key===' '){event.preventDefault();showGroup(group,true);panel.querySelector('.pareto-open')?.focus();}
        if(event.key==='Escape'){pinned=null;selected=null;resetPanel();for(const node of svg.querySelectorAll('.selected'))node.classList.remove('selected');}
        if(['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'].includes(event.key)){
          event.preventDefault();const nodes=[...svg.querySelectorAll('[data-point]')];const i=nodes.indexOf(point);const step=['ArrowRight','ArrowDown'].includes(event.key)?1:-1;nodes[(i+step+nodes.length)%nodes.length]?.focus();
        }
      });
      parts.push(point);
    }
    svg.replaceChildren(...parts);
    ranges.textContent=`${fullScale?'Full scale':'Fitted to all scored ideas'} · F ${fLow.toFixed(1)}–${fHigh.toFixed(1)} · I ${iLow.toFixed(1)}–${iHigh.toFixed(1)}`;
    updateCount();
  }
  function setScale(full){fullScale=full;fitButton.setAttribute('aria-pressed',String(!full));fullButton.setAttribute('aria-pressed',String(full));draw();}
  function updateCount(){const matches=all.filter(r=>visible.has(r.id));const optimal=matches.filter(r=>frontier.has(r.id));summary.textContent=`${matches.length} scored in view · ${optimal.length} of ${frontier.size} Pareto-optimal ideas`;} 
  function update(filteredRows=rows){visible=new Set(filteredRows.map(r=>r.id));draw();if(selected){const g=groups.find(g=>g.key===selected);if(g)showGroup(g,Boolean(pinned));}else resetPanel();}
  const resize=typeof ResizeObserver==='function'?new ResizeObserver(()=>{const next=Math.max(280,Math.round(chart.getBoundingClientRect().width||760));if(next!==width)draw();}):null;
  resize?.observe(chart);draw();
  return {update,frontierIds:frontier,select(id){const group=groups.find(g=>g.rows.some(r=>r.id===id));if(group)showGroup(group,true);},destroy(){destroyed=true;resize?.disconnect();container.replaceChildren();}};
}
