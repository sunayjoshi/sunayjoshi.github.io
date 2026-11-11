import{sortIdeas}from'./sorting.js?v=20261111e';
import{createSearch,searchText}from'./search.js?v=20261111e';
import{paretoIds,mountPareto}from'./pareto.js?v=20261111e';
import{indexHierarchy,mountBubbles}from'./bubbles.js?v=20261111e';
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeURL=value=>{try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}};
const link=(url,label)=>safeURL(url)?`<a href="${esc(safeURL(url))}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`:esc(label);
let rows=[],nodes=new Map(),frontier=new Set(),plot=null,bubbles=null,method=null,engine=null,tree=null,treeIndex=null,matches=new Map(),topicMetadata={};
let state={view:'bubbles',topic:'all',sort:'relevance',q:'',pareto:false},dialogId=null;
const componentNames={claim:'Claim and contribution',technical:'Technical tractability',resources:'Resources and access',validation:'Validation and completion',value:'Value of the result',reach:'Reach and transfer',distinctiveness:'Distinctiveness'};
const fmt=n=>Number(n).toFixed(1);
const hashID=()=>{try{return decodeURIComponent(location.hash.slice(1));}catch{return '';}};
function score(row,key,label){const value=row[key]??null;return `<span class="score ${key==='I'?'impact ':''}${value===null?'na':''}" aria-label="${label}: ${value===null?'not scored':value+' out of 5'}${row.confidence==='low'&&value!==null?', low confidence':''}">${value===null?(row.status==='unassessed_proposal'?'Unrated':'N/A'):`${fmt(value)}<small>/5</small>${row.confidence==='low'?'<sup title="Low confidence">*</sup>':''}`}</span>`;}
function breakdownHTML(row){
 if(row.F===null||!row.F_components||!method?.refinement)return '';
 const table=(key,title,weights)=>`<div><h4>${title}</h4><table><thead><tr><th>Criterion</th><th>Score</th><th>Weight</th></tr></thead><tbody>${Object.entries(row[key]).map(([k,v])=>`<tr><td>${esc(componentNames[k])}</td><td>${fmt(v)}</td><td>${Math.round(weights[k]*100)}%</td></tr>`).join('')}</tbody></table></div>`;
 return `<details class="score-breakdown"><summary>Score breakdown</summary><div class="breakdown-grid">${table('F_components','Feasibility',method.refinement.feasibility.weights)}${table('I_components','Impact',method.refinement.impact.weights)}</div><p><strong>Feasibility refinement.</strong> ${esc(row.F_note)}</p><p><strong>Impact refinement.</strong> ${esc(row.I_note)}</p><p class="component-note">Feasibility is capped at the weakest component + 1.0. Both weighted indices are rounded to one decimal. Prior coarse assessment: F ${row.coarse_F}/5, I ${row.coarse_I}/5. The weights and cap are judgment calls; small decimal gaps are weak evidence.</p></details>`;
}
function detailsHTML(row){
 const tags=(topicMetadata[row.id]?.tags||[]).slice(0,5).map(tag=>`<button type="button" data-query="${esc(tag)}">${esc(tag)}</button>`).join('');
 const scope=row.status==='unassessed_proposal'?'Not yet assessed':row.F===null?'Entry assessment':'Version assessed';
 const checked=new Map((row.audit_evidence||[]).filter(e=>e.url).map(e=>[e.url,e]));
 const refs=[...new Set([...(row.evidence||[]),...checked.keys()])].filter(safeURL);
 const references=refs.map((url,i)=>{const e=checked.get(url);const host=new URL(url).hostname.replace(/^www\./,'');let text='';if(e){const establishes=e.establishes||e.supports||e.findings||e.does;const leaves=e.does_not_establish||e.does_not_resolve||e.limits||e.does_not;const level=e.checked_level||e.checked||e.access||e.sections_read;if(level)text+=`<p>${esc(level)}</p>`;if(establishes)text+=`<p><strong>Establishes:</strong> ${esc(establishes)}</p>`;if(leaves)text+=`<p><strong>Leaves open:</strong> ${esc(leaves)}</p>`;}return `<li>${link(url,`Source ${i+1} · ${host}`)}${text}</li>`;}).join('');
 const related=(row.related_ids||[]).map(id=>rows.some(r=>r.id===id||(r.aliases||[]).includes(id))?`<a href="#${esc(id)}" data-idea="${esc(id)}">${esc(id)}</a>`:`<span> ${esc(id)}</span>`).join('');
 const originalNote=String(row.original_note||'').replace('Original citation markers link to Storage; checked references are listed above when available.','').trim();
 return `<p class="context">${esc(row.section||'Additional ideas')}${row.confidence==='low'&&row.F!==null?' · * Low-confidence assessment':''}</p><div class="original">${row.original_html||`<p>${esc(row.original_text||'')}</p>`}</div>${tags?`<div class="detail-tags" aria-label="Explore related topics">${tags}</div>`:''}<div class="assessment"><details class="assessment-disclosure"><summary>${scope}</summary><p>${esc(row.scope||'This entry has not yet received a paper assessment.')}</p>${row.shared_score_from?`<p>Same assessed scope and scores as <a href="#${esc(row.shared_score_from)}" data-idea="${esc(row.shared_score_from)}">${esc(row.shared_score_from)}</a>.</p>`:''}<p><span class="reason-label">Feasibility.</span> ${esc(row.feasibility_reason)}</p><p><span class="reason-label">Impact.</span> ${esc(row.impact_reason)}</p>${breakdownHTML(row)}</details><details class="assessment-disclosure first-check"><summary>First check</summary><p>${esc(row.gate)}</p></details></div>${references?`<details class="references"><summary>Literature and comparisons (${refs.length})</summary><ul>${references}</ul><p>Targeted checks; exhaustive novelty clearance is not established.</p></details>`:''}${related?`<p class="related">Related ideas ${related}</p>`:''}<p class="source-note">${link(row.source_url,'Open original document ↗')} · ${esc(row.source_location||row.source_file||'Sunay Storage')}${originalNote?`<br>${esc(originalNote)}`:''}</p>`;
}
function makeRow(row){
 const el=document.createElement('details');el.className='idea';el.id=row.id;el.dataset.id=row.id;
 el.innerHTML=`<summary><span class="idea-heading"><span class="chevron" aria-hidden="true">›</span><span class="idea-id">${esc(row.id)}</span><span class="idea-title">${esc(row.title)}${frontier.has(row.id)?'<span class="frontier-tag">Pareto</span>':''}<span class="match-excerpt"></span></span></span>${score(row,'F','Feasibility')}${score(row,'I','Impact')}</summary>`;
 el.addEventListener('toggle',()=>{if(el.open&&!el.querySelector('.idea-body')){const body=document.createElement('div');body.className='idea-body';body.innerHTML=detailsHTML(row)+`<p><a href="#${esc(row.id)}" data-idea="${esc(row.id)}">Open shareable view ↗</a></p>`;el.append(body);}});return el;
}
function readURL(){
 const p=new URLSearchParams(location.search);
 state={view:['list','bubbles','pareto'].includes(p.get('view'))?p.get('view'):'bubbles',topic:p.get('topic')||'all',sort:['document','feasibility','impact','product','relevance'].includes(p.get('sort'))?p.get('sort'):'relevance',q:p.get('q')||'',pareto:p.get('pareto')==='1'};
 if(treeIndex&&!treeIndex.nodes.has(state.topic))state.topic=tree.id;
 $('search').value=state.q;$('sort').value=state.sort;$('pareto-only').checked=state.pareto;
}
function writeURL(push=false){
 const u=new URL(location.href);for(const key of ['view','topic','sort','q','pareto','plot'])u.searchParams.delete(key);
 if(state.view!=='bubbles')u.searchParams.set('view',state.view);if(state.topic!=='all')u.searchParams.set('topic',state.topic);if(state.sort!=='relevance')u.searchParams.set('sort',state.sort);if(state.q)u.searchParams.set('q',state.q);if(state.pareto)u.searchParams.set('pareto','1');
 history[push?'pushState':'replaceState'](null,'',u);
}
function navigateTopic(id,push=true){if(!treeIndex.nodes.has(id))return;state.topic=id;render();writeURL(push);}
function changeView(view,push=true){state.view=view;render();writeURL(push);}
function render(){
 if(!engine)return;
 const query=state.q.trim();const results=engine.search(query);matches=new Map(results.map(r=>[r.idea.id,r]));
 const permitted=treeIndex.descendants.get(state.topic)||treeIndex.descendants.get(tree.id);
 let selected=results.map(r=>r.idea).filter(r=>permitted.has(r.id));if(state.pareto)selected=selected.filter(r=>frontier.has(r.id));
 selected=sortIdeas(selected,state.sort,query);
 const frag=document.createDocumentFragment();for(const row of selected){const node=nodes.get(row.id);const excerpt=node.querySelector('.match-excerpt');const match=matches.get(row.id);excerpt.textContent=query?((match?.reason?match.reason+' · ':'')+(match?.excerpt||'')):'';excerpt.hidden=!query;frag.append(node);}$('ideas').replaceChildren(frag);
 for(const view of ['list','bubbles','pareto']){const active=state.view===view;$(`${view}-panel`).hidden=!active;$(`tab-${view}`).setAttribute('aria-selected',String(active));$(`tab-${view}`).tabIndex=active?0:-1;}
 const rated=selected.filter(r=>r.F!=null).length,unrated=selected.filter(r=>r.status==='unassessed_proposal').length;
 $('count').textContent=`${selected.length} ${selected.length===1?'idea':'ideas'} · ${rated} rated${unrated?` · ${unrated} unrated`:''}`;
 $('empty').hidden=selected.length>0;$('clear').hidden=!state.q;$('reset-filters').hidden=!(state.q||state.topic!=='all'||state.pareto);
 const rootLabel=tree.name||tree.label||'All ideas';const path=treeIndex.path(state.topic);$('breadcrumbs').replaceChildren();
 path.forEach((node,i)=>{if(i){const s=document.createElement('span');s.className='breadcrumb-separator';s.textContent='/';s.setAttribute('aria-hidden','true');$('breadcrumbs').append(s);}const button=document.createElement('button');button.type='button';button.textContent=i===0?'All ideas':node.name||node.label;button.setAttribute('aria-current',i===path.length-1?'page':'false');button.addEventListener('click',()=>navigateTopic(node.id));$('breadcrumbs').append(button);});
 $('topic').querySelector('[data-deep]')?.remove();const knownOptions=[...$('topic').options].map(o=>o.value);if(!knownOptions.includes(state.topic)){const opt=document.createElement('option');opt.value=state.topic;opt.textContent=treeIndex.nodes.get(state.topic)?.name||state.topic;opt.dataset.deep='true';$('topic').append(opt);}$('topic').value=state.topic;
 if(state.view==='bubbles')bubbles.update(selected,state.topic);if(state.view==='pareto')plot.update(selected);
}
function openIdea(id,updateHash=true){
 const row=rows.find(r=>r.id===id||(r.aliases||[]).includes(id));if(!row)return;
 dialogId=row.id;$('dialog-id').textContent=row.id;$('dialog-title').textContent=row.title;
 $('visibility-control').href=`https://sunay-idea-visibility.sunay-joshi1.chatgpt.site/?idea=${encodeURIComponent(row.id)}`;
 $('dialog-scores').innerHTML=`${score(row,'F','Feasibility')}${score(row,'I','Impact')}<span>${row.status==='unassessed_proposal'?'Not yet assessed':'Feasibility · Impact'}</span>`;
 $('dialog-body').innerHTML=detailsHTML(row);$('copy-link').textContent='Copy link';
 if(!$('idea-dialog').open)$('idea-dialog').showModal();$('idea-dialog').scrollTop=0;
 if(updateHash){const u=new URL(location.href);u.hash=row.id;history.pushState(null,'',u);}
}
function closeDialog(){if($('idea-dialog').open)$('idea-dialog').close();dialogId=null;if(location.hash){const u=new URL(location.href);u.hash='';history.replaceState(null,'',u);}}
function reset(){state.q='';state.topic='all';state.pareto=false;$('search').value='';$('pareto-only').checked=false;render();writeURL();$('search').focus();}
readURL();
$('search').addEventListener('input',()=>{state.q=$('search').value;if(state.q.trim())state.view='list';render();writeURL();});
$('sort').addEventListener('change',()=>{state.sort=$('sort').value;render();writeURL();});
$('topic').addEventListener('change',()=>navigateTopic($('topic').value));
$('pareto-only').addEventListener('change',()=>{state.pareto=$('pareto-only').checked;render();writeURL();});
$('clear').addEventListener('click',()=>{state.q='';$('search').value='';render();writeURL();$('search').focus();});
$('reset').addEventListener('click',reset);$('reset-filters').addEventListener('click',reset);
$('close-dialog').addEventListener('click',closeDialog);$('idea-dialog').addEventListener('cancel',e=>{e.preventDefault();closeDialog();});
$('idea-dialog').addEventListener('click',e=>{if(e.target===$('idea-dialog')){const b=$('idea-dialog').getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)closeDialog();}});
$('copy-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);$('copy-link').textContent='Copied';}catch{$('copy-link').textContent='Link is in the address bar';}});
document.querySelectorAll('[data-view]').forEach(button=>{button.addEventListener('click',()=>changeView(button.dataset.view));button.addEventListener('keydown',e=>{const tabs=[...document.querySelectorAll('[data-view]')];let next=tabs.indexOf(button);if(e.key==='ArrowRight')next=(next+1)%tabs.length;else if(e.key==='ArrowLeft')next=(next+tabs.length-1)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();changeView(tabs[next].dataset.view);tabs[next].focus();});});
document.addEventListener('click',e=>{const a=e.target.closest('a[data-idea]');if(a){e.preventDefault();openIdea(a.dataset.idea);}const suggestion=e.target.closest('[data-query]');if(suggestion){if($('idea-dialog').open)closeDialog();state.q=suggestion.dataset.query;state.topic='all';state.view='list';$('search').value=state.q;render();writeURL(true);}});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!$('idea-dialog').open&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();$('search').focus();}if(e.key==='Escape'&&document.activeElement===$('search')){$('clear').click();}});
window.addEventListener('popstate',()=>{readURL();render();const id=hashID();if(id)openIdea(id,false);else if($('idea-dialog').open){$('idea-dialog').close();dialogId=null;}});
window.addEventListener('hashchange',()=>{const id=hashID();if(id)openIdea(id,false);else if($('idea-dialog').open)$('idea-dialog').close();});
const fetchJSON=async(path,optional=false)=>{try{const r=await fetch(path+'?v=20261111e',{cache:'no-cache'});if(!r.ok)throw new Error(`${path}: ${r.status}`);return await r.json();}catch(e){if(optional)return null;throw e;}};
try{
 const [data,taxonomy,index]=await Promise.all([fetchJSON('./ideas.json'),fetchJSON('./taxonomy.json'),fetchJSON('./semantic-index.json',true)]);
 rows=data.ideas.map((r,order)=>({...r,order,aliases:r.aliases||[],search_text:searchText(r)}));
 topicMetadata=taxonomy.byId||{};tree=taxonomy.root||taxonomy;treeIndex=indexHierarchy(tree);method=data.method;frontier=paretoIds(rows);engine=createSearch(rows,index,taxonomy);
 for(const node of tree.children||[]){const option=document.createElement('option');option.value=node.id;option.textContent=node.name||node.label;$('topic').append(option);}
 for(const row of rows)nodes.set(row.id,makeRow(row));plot=mountPareto($('pareto-chart'),{rows,onOpen:openIdea});bubbles=mountBubbles($('bubbles-chart'),{hierarchy:tree,onNavigate:navigateTopic,onOpen:openIdea});
 $('search-status').textContent=index?'Search by topic, meaning, keywords, or idea ID.':'Topic and keyword search is ready.';
 const m=data.method;$('rubric-body').innerHTML=`<p><strong>Feasibility</strong> — a credible paper in twelve weeks. <strong>Impact</strong> — the value of that result if it succeeds.</p><p>${esc(m.baseline)}</p><p>${esc(m.caveats)}</p><p>Each 1.0–5.0 index combines explicit subcriteria. Feasibility weights: claim 25%, technical tractability 30%, resources 25%, validation 20%; capped at the weakest component + 1.0. Impact weights: value 45%, reach 30%, distinctiveness 25%. Both are rounded to one decimal. Impact × feasibility sorting multiplies the displayed scores; unscored ideas appear last. This is an optional ordering heuristic. Exact ties retain document order. Pareto comparisons use the displayed tenths across all active, scored ideas, independent of the current filter.</p><table><thead><tr><th>Score</th><th>Feasibility</th><th>Impact</th></tr></thead><tbody>${m.anchors.map(([n,f,i])=>`<tr><td>${n}</td><td>${esc(f)}</td><td>${esc(i)}</td></tr>`).join('')}</tbody></table><p>${esc(m.evidence)}</p><p>Content updated November 11, 2026. Existing scores retain their November 10 review. New questions marked “Unrated” have not been assessed. Reflections and project notes are not paper proposals. This navigator is a reviewed snapshot; later Overleaf edits do not import automatically.</p>`;
 readURL();render();if(location.hash)openIdea(hashID(),false);
}catch(error){console.error(error);$('count').textContent='The navigator could not load.';$('search-status').textContent='Please reload, or open the original document above.';$('bubbles-chart').innerHTML='<p class="load-error">The idea data could not be loaded. Please reload this page.</p>';}
