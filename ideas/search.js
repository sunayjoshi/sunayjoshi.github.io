const DEFAULT_CONCEPTS = [{"id": "pretraining", "label": "Pretraining & data mixtures", "phrases": ["pretraining", "pre-training", "continued pretraining", "data mix", "data mixture", "data mixtures", "training data", "train models"], "expand": ["pretraining", "training", "mixture", "curriculum", "capability", "data"]}, {"id": "energy", "label": "Energy & electricity", "phrases": ["electricity", "electric", "power grid", "energy", "energy storage", "renewable", "renewables", "solar", "wind power", "electricity grid"], "expand": ["energy", "electricity", "power", "storage", "routing", "sources"]}, {"id": "effort", "label": "Effort & shortcuts", "phrases": ["lazy", "laziness", "slacking", "slack off", "shortcuts", "shortcut", "premature stopping", "effort", "give up", "gives up", "not trying", "checking cost", "verification cost"], "expand": ["effort", "shortcut", "verification", "checking", "stopping", "incentive", "compute"]}, {"id": "deception", "label": "Honesty & oversight", "phrases": ["lying", "lies", "lie", "dishonest", "dishonesty", "deceptive", "deception", "conceal", "concealing", "sandbagging", "monitoring", "oversight", "audit", "auditing", "cheat", "cheating"], "expand": ["honest", "oversight", "monitor", "detection", "incentive", "conceal", "audit"]}, {"id": "medicine", "label": "Medical decisions", "phrases": ["doctor", "doctors", "physician", "physicians", "clinician", "clinicians", "medical", "medicine", "hospital", "hospitals", "diagnosis", "diagnostic", "clinical", "healthcare", "health care", "patient", "patients"], "expand": ["clinical", "medical", "diagnosis", "doctor", "treatment", "human", "decision"]}, {"id": "trust", "label": "Trust & delegation", "phrases": ["trust", "trusting", "rely", "relying", "reliance", "defer", "deferral", "delegation", "delegate", "abstention", "abstain", "human ai", "human-ai", "human–ai"], "expand": ["human", "reliability", "uncertainty", "decision", "delegation", "oversight"]}, {"id": "curiosity", "label": "Curiosity & learning", "phrases": ["enjoyment", "enjoy", "joy", "fun", "curiosity", "curious", "brainpop", "childhood", "learner", "learners", "hobby", "intrinsic", "learning for its own sake", "learning for enjoyment"], "expand": ["curiosity", "learning", "creative", "creativity", "intellectual", "enjoyment", "discovery"]}, {"id": "creativity", "label": "Creativity & style", "phrases": ["creative", "creativity", "art", "artistic", "writing", "writer", "style", "rewrite", "rewriting", "poetry", "poem", "taste"], "expand": ["creative", "style", "writing", "taste", "personalization", "revision"]}, {"id": "synthetic", "label": "Synthetic training data", "phrases": ["synthetic", "generated data", "artificial data", "pretraining", "pre-training", "continued pretraining", "data mix", "data mixture", "data mixtures", "model collapse", "distillation", "distill", "curriculum", "curricula"], "expand": ["synthetic", "training", "pretraining", "data", "mixture", "curriculum", "distillation"]}, {"id": "safety", "label": "Safety & alignment", "phrases": ["safety", "safe", "unsafe", "alignment", "aligned", "jailbreak", "jailbreaking", "attack", "attacks", "adversarial", "weight editing"], "expand": ["safety", "alignment", "adversarial", "defense", "constraint", "monitor"]}, {"id": "reasoning", "label": "Reasoning & computation", "phrases": ["reasoning", "think", "thinking", "cot", "chain of thought", "chain-of-thought", "search", "backtracking", "computation", "compute", "inference time", "test time"], "expand": ["reasoning", "search", "computation", "budget", "inference"]}, {"id": "proofs", "label": "Mathematical verification", "phrases": ["proof", "proofs", "prove", "theorem", "theorems", "mathematics", "mathematical", "verification", "verifier"], "expand": ["proof", "mathematical", "verification", "theorem", "error"]}, {"id": "statistics", "label": "Statistical guarantees", "phrases": ["uncertainty", "confidence", "coverage", "calibration", "conformal", "risk control", "guarantee", "guarantees", "statistical"], "expand": ["calibration", "risk", "coverage", "statistical", "uncertainty", "conformal"]}, {"id": "causal", "label": "Causal inference", "phrases": ["causal", "causality", "cause", "causes", "treatment effects", "natural experiment", "randomization", "counterfactual", "confounding"], "expand": ["causal", "treatment", "randomization", "experiment", "identification"]}, {"id": "agents", "label": "Multi-agent systems", "phrases": ["agents", "agent", "multiagent", "multi-agent", "coordination", "collaboration", "cooperation", "collusion", "orchestration", "communication", "teams"], "expand": ["agent", "cooperation", "communication", "coordination", "interaction"]}, {"id": "economics", "label": "Economics & markets", "phrases": ["economics", "economic", "economy", "economies", "markets", "market", "finance", "financial", "money", "investing", "investment", "investor", "trading", "trader"], "expand": ["economic", "market", "financial", "incentive", "decision", "model"]}, {"id": "biology", "label": "Biology & imaging", "phrases": ["biology", "biological", "cell", "cells", "single cell", "transcriptomics", "protein", "proteins", "anatomy", "imaging", "mri", "digital twins"], "expand": ["biological", "cell", "protein", "imaging", "medical", "structure"]}, {"id": "architecture", "label": "Model architectures", "phrases": ["architecture", "architectures", "transformer", "transformers", "attention", "representation", "representations", "embedding", "embeddings", "layers", "neural network"], "expand": ["representation", "architecture", "attention", "network", "model"]}, {"id": "memory", "label": "Memory & adaptation", "phrases": ["memory", "remember", "forget", "forgetting", "unlearning", "retention", "adaptation", "adapt", "continual learning", "fine-tuning", "finetuning"], "expand": ["memory", "forgetting", "adaptation", "learning", "training"]}, {"id": "research", "label": "Research & careers", "phrases": ["career", "careers", "job", "jobs", "business school", "booth", "professor", "professorship", "faculty", "academic", "academia", "mentorship", "internship"], "expand": ["career", "research", "academic", "community", "applied"]}];
const DEFAULT_STOPWORDS = ["a", "about", "above", "across", "after", "afterwards", "again", "against", "ai", "all", "almost", "alone", "along", "already", "also", "although", "always", "am", "among", "amongst", "amoungst", "amount", "an", "and", "another", "any", "anyhow", "anyone", "anything", "anyway", "anywhere", "are", "around", "as", "at", "back", "be", "became", "because", "become", "becomes", "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides", "between", "beyond", "bill", "both", "bottom", "but", "by", "call", "can", "cannot", "cant", "co", "con", "could", "couldnt", "cry", "de", "describe", "detail", "do", "does", "doing", "done", "down", "due", "during", "each", "eg", "eight", "either", "eleven", "else", "elsewhere", "empty", "enough", "etc", "even", "ever", "every", "everyone", "everything", "everywhere", "except", "few", "fifteen", "fifty", "fill", "find", "fire", "first", "five", "for", "former", "formerly", "forty", "found", "four", "from", "front", "full", "further", "get", "give", "go", "had", "has", "hasnt", "have", "he", "help", "helps", "hence", "her", "here", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "him", "himself", "his", "how", "however", "hundred", "i", "idea", "ideas", "ie", "if", "in", "inc", "indeed", "interest", "interested", "into", "is", "it", "its", "itself", "keep", "know", "last", "latter", "latterly", "least", "less", "like", "llm", "llms", "look", "looking", "ltd", "made", "make", "many", "may", "me", "meanwhile", "might", "mill", "mine", "model", "models", "more", "moreover", "most", "mostly", "move", "much", "must", "my", "myself", "name", "namely", "need", "neither", "never", "nevertheless", "next", "nine", "no", "nobody", "none", "noone", "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on", "once", "one", "only", "onto", "or", "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own", "part", "per", "perhaps", "please", "put", "question", "questions", "rather", "re", "really", "same", "see", "seem", "seemed", "seeming", "seems", "serious", "several", "she", "should", "show", "side", "since", "sincere", "six", "sixty", "so", "some", "somebody", "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "such", "system", "take", "tell", "ten", "than", "that", "the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they", "thick", "thin", "thing", "things", "think", "third", "this", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "top", "toward", "towards", "twelve", "twenty", "two", "un", "under", "until", "up", "upon", "us", "use", "using", "very", "via", "want", "wants", "was", "we", "well", "were", "what", "whatever", "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "whoever", "whole", "whom", "whose", "why", "will", "with", "within", "without", "work", "works", "would", "yet", "you", "your", "yours", "yourself", "yourselves"];

export function normalize(value) {
  return String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’‘]/g, "'").replace(/[–—−]/g, '-');
}
export function searchText(row) {
  return normalize([row.id,row.title,row.original_title,row.original_text,row.scope,row.section,...(row.aliases||[]),...(row.related_ids||[])].join(' '));
}
const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const countTerms = terms => { const m = new Map(); for(const t of terms)m.set(t,(m.get(t)||0)+1); return m; };
const cleanText = s => String(s||'').replace(/\\n/g,' ').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();

/** Offline search. Optional corpus SVD index improves paraphrase retrieval; exact words and
 * curated concepts remain available if that asset cannot load. No request leaves the page. */
export function createSearch(ideas, index = null, taxonomy = null) {
  const stop = new Set(index?.stopwords || DEFAULT_STOPWORDS);
  const tokenize = s => (normalize(s).match(/[a-z][a-z0-9]{1,}/g)||[]).filter(t=>!stop.has(t));
  const concepts = index?.concepts || DEFAULT_CONCEPTS;
  const conceptPatterns = concepts.map(c=>({...c, patterns:c.phrases.map(p=>new RegExp('(^|[^a-z0-9])'+escapeRegExp(normalize(p))+'($|[^a-z0-9])'))}));
  const detectConcepts = s => {s=normalize(s);return conceptPatterns.filter(c=>c.patterns.some(p=>p.test(s)));};
  const meta=taxonomy?.byId || {};
  const df=new Map();
  const docs=ideas.map((idea,order)=>{
    const title=cleanText(idea.title),scope=cleanText(idea.scope),body=cleanText(idea.original_text);
    const ti=countTerms(tokenize(title)),sc=countTerms(tokenize(scope)),bo=countTerms(tokenize(body));
    const terms=new Set([...ti.keys(),...sc.keys(),...bo.keys()]);for(const t of terms)df.set(t,(df.get(t)||0)+1);
    const found=meta[idea.id]?.concepts || detectConcepts(title+' '+scope).map(c=>c.id);
    return {idea,order,title,scope,body,ti,sc,bo,terms,concepts:new Set(found),bodyConcepts:new Set(detectConcepts(body).map(c=>c.id))};
  });
  const indexValid=index && Array.isArray(index.ids) && index.ids.length===ideas.length && index.ids.every(id=>ideas.some(r=>r.id===id));
  const vocab=indexValid?new Map(index.terms.map((t,i)=>[t,i])):null;
  const docVectors=indexValid?new Map(index.ids.map((id,i)=>[id,index.vectors[i]])):null;
  function project(terms){
    if(!vocab)return null;
    const v=new Float64Array(index.dimensions);let used=0;
    for(const [t,count] of countTerms(terms)){
      const j=vocab.get(t);if(j===undefined)continue;used++;
      const w=(1+Math.log(count))*index.idf[j];const p=index.projection[j];
      for(let k=0;k<v.length;k++)v[k]+=w*p[k]/index.scale;
    }
    const norm=Math.hypot(...v);if(!used||!norm)return null;
    return v.map(x=>x/norm);
  }
  function excerpt(doc,terms,matchedConcepts){
    const source=doc.body||doc.scope||doc.title;
    const needles=[...terms,...matchedConcepts.flatMap(c=>c.phrases)];
    const low=normalize(source);
    let at=-1;for(const t of needles){const p=low.indexOf(normalize(t));if(p>=0&&(at<0||p<at))at=p;}
    const start=at<0?0:Math.max(0,at-70),end=Math.min(source.length,start+230);
    return (start?'…':'')+source.slice(start,end).trim()+(end<source.length?'…':'');
  }
  function search(query){
    const q=normalize(query).trim().slice(0,600);
    if(!q)return docs.map(d=>({idea:d.idea,score:0,reason:'',excerpt:d.scope||d.body.slice(0,230),topics:meta[d.idea.id]?.tags||[]}));
    const exactId=q.match(/^(?:idea[-\s]?)?([behrsf]\d{2,3})$/i)?.[1]?.toUpperCase();
    if(exactId){return docs.filter(d=>d.idea.id===exactId||(d.idea.aliases||[]).includes(exactId)).map(d=>({idea:d.idea,score:100,reason:d.idea.id===exactId?'Exact idea ID':'Merged idea ID',excerpt:excerpt(d,[],[]),topics:meta[d.idea.id]?.tags||[]}));}
    const terms=[...new Set(tokenize(q))];
    const matchedConcepts=detectConcepts(q);
    if(!terms.length&&!matchedConcepts.length)return [];
    const expanded=terms.concat(matchedConcepts.flatMap(c=>c.expand));
    const projected=project(expanded);
    const available=terms.filter(t=>df.has(t));
    const weights=new Map(available.map(t=>[t,Math.log(1+(docs.length-(df.get(t)||0)+.5)/((df.get(t)||0)+.5))]));
    const totalWeight=[...weights.values()].reduce((a,b)=>a+b,0)||1;
    const results=[];
    for(const d of docs){
      let lexical=0,hits=0;
      for(const t of available){
        const tf=2.4*(d.ti.get(t)||0)+1.25*(d.sc.get(t)||0)+.35*(d.bo.get(t)||0);
        if(tf){lexical+=weights.get(t)*(tf/(tf+1.4));hits++;}
      }
      lexical/=totalWeight;
      const matched=matchedConcepts.filter(c=>d.concepts.has(c.id));
      const partial=matchedConcepts.filter(c=>!d.concepts.has(c.id)&&d.bodyConcepts.has(c.id));
      const conceptual=matchedConcepts.length?(matched.length+.18*partial.length)/matchedConcepts.length:0;
      let semantic=0;if(projected){const dv=docVectors.get(d.idea.id);for(let k=0;k<projected.length;k++)semantic+=projected[k]*dv[k]/index.scale;semantic=Math.max(0,semantic);}
      const phrase=d.title.toLowerCase().includes(q)&&q.length>3?.9:0;
      const coverage=available.length?hits/available.length:0;
      // A related latent vector alone must be fairly close; weak shared boilerplate is excluded.
      if(!hits&&!matched.length&&semantic<.47)continue;
      const score=5*lexical+1.55*conceptual+1.35*semantic+.4*coverage+phrase;
      const reason=matched.length?'Related: '+matched.slice(0,2).map(c=>c.label.toLowerCase()).join(' · '):hits?'Matches your words': 'Related wording and concepts';
      results.push({idea:d.idea,score,reason,excerpt:excerpt(d,terms,matchedConcepts),topics:meta[d.idea.id]?.tags||[],_order:d.order,_hits:hits,_conceptual:conceptual,_semantic:semantic});
    }
    results.sort((a,b)=>b.score-a.score||a._order-b._order);
    const best=results[0]?.score||0;
    // Show credible matches, not the entire notebook for every sentence.
    return results.filter(r=>r.score>=Math.max(.9,best*.38));
  }
  return {search,topics:taxonomy?.domains||[],topicHierarchy:taxonomy?.root||null,method:indexValid?'latent-semantic':'concept-and-keyword'};
}

// Compatibility for the original list and its existing regression checks.
export function selectRows(rows,query,sort='relevance') {
  let selected=createSearch(rows).search(query).map(r=>r.idea);
  const key={feasibility:'F',impact:'I'}[sort];
  if(key)selected.sort((a,b)=>(b[key]??-1)-(a[key]??-1)||(a.order??0)-(b.order??0));
  else if(sort==='document'||sort==='order')selected.sort((a,b)=>(a.order??0)-(b.order??0));
  return selected;
}
