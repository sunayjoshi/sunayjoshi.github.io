// Stable, deterministic circle packing. Geometry uses the full topic tree;
// filters only change emphasis and counts, so a search does not reshuffle ideas.
export function indexHierarchy(root){
 const nodes=new Map(),parents=new Map(),descendants=new Map();
 function walk(node,parent){nodes.set(node.id,node);if(parent)parents.set(node.id,parent.id);const ids=node.ideaId?[node.ideaId]:(node.children||[]).flatMap(child=>walk(child,node));descendants.set(node.id,new Set(ids));return ids;}
 walk(root,null);return {nodes,parents,descendants,path(id){const path=[];while(nodes.has(id)){path.unshift(nodes.get(id));id=parents.get(id);}return path;}};
}
export function packCircles(items){
 if(!items.length)return [];
 const circles=[];
 for(let i=0;i<items.length;i++){
  const weight=Math.max(1,items[i].weight||1),r=Math.max(28,Math.min(82,28+Math.sqrt(weight)*8));
  let placed=null;
  if(i===0)placed={x:0,y:0,r};
  else for(let k=0;k<30000;k++){
   const angle=k*2.399963229728653,dist=3.5*Math.sqrt(k),candidate={x:Math.cos(angle)*dist,y:Math.sin(angle)*dist,r};
   if(circles.every(c=>Math.hypot(c.x-candidate.x,c.y-candidate.y)>=c.r+r+10)){placed=candidate;break;}
  }
  if(!placed){const edge=Math.max(...circles.map(c=>c.x+c.r));placed={x:edge+r+10,y:0,r};}
  circles.push({...placed,item:items[i]});
 }
 const left=Math.min(...circles.map(c=>c.x-c.r)),right=Math.max(...circles.map(c=>c.x+c.r));
 const top=Math.min(...circles.map(c=>c.y-c.r)),bottom=Math.max(...circles.map(c=>c.y+c.r));
 const scale=Math.min(640/(right-left),570/(bottom-top),2.5);
 return circles.map(c=>({...c,x:360+(c.x-(left+right)/2)*scale,y:310+(c.y-(top+bottom)/2)*scale,r:c.r*scale}));
}
const NS='http://www.w3.org/2000/svg';
const svgEl=(tag,attrs={},text)=>{const el=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,v);if(text!==undefined)el.textContent=text;return el;};
function wrapText(text,max=19,maxLines=4){const lines=[],words=String(text).split(/\s+/);let line='';for(const raw of words){const word=raw.length>max?raw.slice(0,max-1)+'…':raw;if(line&&`${line} ${word}`.length>max){lines.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)lines.push(line);if(lines.length>maxLines){lines.length=maxLines;lines[maxLines-1]=lines[maxLines-1].replace(/[.,;:]?$/,'…');}return lines;}
export function mountBubbles(container,{hierarchy,onNavigate,onOpen}){
 const index=indexHierarchy(hierarchy),layoutCache=new Map();let focus=hierarchy.id,visible=new Set(),zooming=false;
 const chart=document.createElement('div');chart.className='bubble-canvas';
 const svg=svgEl('svg',{viewBox:'0 0 720 620',class:'bubble-svg',role:'group','aria-label':'Topic bubbles'});chart.append(svg);
 const side=document.createElement('section');side.className='bubble-directory';side.setAttribute('aria-label','Topics and ideas in this collection');
 container.replaceChildren(chart,side);
 function update(rows,focusId=focus){
  visible=new Set(rows.map(r=>r.id));focus=index.nodes.has(focusId)?focusId:hierarchy.id;
  svg.setAttribute('viewBox','0 0 720 620');zooming=false;
  const node=index.nodes.get(focus),children=node.children||[];
  if(!layoutCache.has(focus))layoutCache.set(focus,packCircles(children.map(n=>({node:n,weight:index.descendants.get(n.id).size}))));
  const geometry=layoutCache.get(focus);svg.replaceChildren(svgEl('title',{},node.name||node.label),svgEl('desc',{},'Choose a topic to zoom in, or an individual idea to read it. The adjacent list provides the same navigation. Bubble area indicates the number of ideas, not their value.'));
  const list=document.createElement('ul');side.replaceChildren(list);
    geometry.forEach(({x,y,r,item},i)=>{
   const child=item.node,total=index.descendants.get(child.id).size,matching=[...index.descendants.get(child.id)].filter(id=>visible.has(id)).length;
   const label=child.name||child.label||child.id,isLeaf=!!child.ideaId;
   const activate=()=>{
    if(!matching||zooming)return;if(isLeaf){onOpen(child.ideaId);return;}
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){onNavigate(child.id);return;}
    zooming=true;const start=performance.now(),target=[x-r*1.15,y-r*1.15,r*2.3,r*2.3],initial=[0,0,720,620];
    const frame=now=>{const t=Math.min(1,(now-start)/260),e=1-(1-t)**3;svg.setAttribute('viewBox',initial.map((v,j)=>v+(target[j]-v)*e).join(' '));if(t<1)requestAnimationFrame(frame);else onNavigate(child.id);};requestAnimationFrame(frame);
   };
   const group=svgEl('g',{transform:`translate(${x} ${y})`,class:`topic-bubble${matching?'':' is-dim'}${isLeaf?' is-leaf':''}`,role:'button',tabindex:matching?'0':'-1','aria-label':isLeaf?`Open ${child.ideaId}: ${label}`:`Explore ${label}, ${matching} of ${total} ideas`,'aria-disabled':matching?'false':'true','data-topic':child.id});
   const tint=['#e4edf4','#edf1f3','#e5ece9','#edeaf1','#f1ede5','#e8edf5','#e9eff0','#eee9e7'][i%8];
   group.append(svgEl('circle',{r,fill:tint}),svgEl('title',{},`${label} · ${matching} of ${total} ideas`));
   const font=Math.min(19,Math.max(11,r/5.7)),maxChars=Math.max(7,Math.floor((2*r*.78)/(font*.54))),lines=wrapText(label,maxChars,r<50?3:4),lineHeight=font*1.22;
   const text=svgEl('text',{'text-anchor':'middle','font-size':font,'pointer-events':'none','aria-hidden':'true'});
   lines.forEach((line,j)=>text.append(svgEl('tspan',{x:0,y:(j-(lines.length-1)/2)*lineHeight-7},line)));
   text.append(svgEl('tspan',{x:0,y:(lines.length/2)*lineHeight+13,class:'bubble-count','font-size':Math.max(10,font*.72)},isLeaf?child.ideaId:`${matching===total?total:`${matching} / ${total}`} ideas`));group.append(text);
   group.addEventListener('click',activate);group.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}if(e.key==='Escape')onNavigate(index.parents.get(focus)||hierarchy.id);});svg.append(group);
   const li=document.createElement('li'),button=document.createElement('button');button.type='button';button.disabled=!matching;button.className=isLeaf?'bubble-list-leaf':'';
   const title=document.createElement('span');title.textContent=label;const count=document.createElement('span');count.className='bubble-list-count';count.textContent=isLeaf?child.ideaId:`${matching===total?total:`${matching}/${total}`} →`;button.append(title,count);button.addEventListener('click',activate);li.append(button);list.append(li);
  });
  if(!children.length){const message=document.createElement('p');message.textContent='No subtopics in this collection.';side.append(message);}
 }
 return {update,index};
}
