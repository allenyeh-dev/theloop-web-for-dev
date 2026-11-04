'use strict';
const $ = s => document.querySelector(s);
const dialog = $('#projectDialog');
let projects = [], filter = 'All', expanded = false, current, imageIndex = 0;
function showImage() {
  const images = current.images;
  $('#detailImage').src = images[imageIndex] || '';
  $('#detailImage').alt = `${current.title} — ${imageIndex + 1}`;
  $('#imageCount').textContent = `${imageIndex + 1} / ${images.length}`;
  $('#prev').hidden = $('#next').hidden = images.length < 2;
}
function openProject(p) {
  current = p; imageIndex = 0;
  $('#detailTitle').textContent = p.title;
  $('#detailCategory').textContent = p.category;
  $('#detailText').textContent = p.text;
  $('#original').href = `project.html?p=${encodeURIComponent(p.slug)}`;
  $('#detailFields').replaceChildren();
  Object.entries(p.fields).filter(([,v]) => v).forEach(([key,value]) => {
    const dt = document.createElement('dt'), dd = document.createElement('dd');
    dt.textContent = key; dd.textContent = value;
    $('#detailFields').append(dt,dd);
  });
  showImage(); dialog.showModal(); dialog.scrollTop = 0; document.body.classList.add('modal-open');
}
function render() {
  const selected = projects.filter(p => filter === 'All' || p.category === filter);
  const visible = expanded ? selected : selected.slice(0,6);
  $('#projects').replaceChildren();
  visible.forEach((p,i) => {
    const button = document.createElement('button'); button.className = 'project';
    button.setAttribute('aria-label',`View ${p.title}`);
    const photo = document.createElement('div'); photo.className = 'photo';
    const img = document.createElement('img'); img.src = p.images[0]; img.alt = p.title;
    img.loading = i < 2 ? 'eager' : 'lazy'; img.decoding = 'async';
    const arrow = document.createElement('span'); arrow.className = 'arrow'; arrow.textContent = '↗'; arrow.setAttribute('aria-hidden','true');
    photo.append(img,arrow);
    const info = document.createElement('div'); info.className = 'project-info';
    const title = document.createElement('h3'); title.textContent = p.title;
    const category = document.createElement('p'); category.textContent = p.category;
    info.append(title,category); button.append(photo,info);
    button.addEventListener('click',() => openProject(p)); $('#projects').append(button);
  });
  $('#more').hidden = expanded || selected.length <= 6;
  $('#more').style.display = $('#more').hidden ? 'none' : 'block';
  $('#more').textContent = `Explore all ${selected.length} projects ↓`;
  document.querySelectorAll('[data-filter]').forEach(b => {
    const active = b.dataset.filter === filter;
    b.classList.toggle('active',active); b.setAttribute('aria-pressed',String(active));
  });
  if (window.ScrollTrigger) ScrollTrigger.refresh(); // the grid changes the page height under the title triggers
}
fetch('projects.json').then(r => {if(!r.ok) throw Error('Content unavailable');return r.json();}).then(data => {projects=data;render();}).catch(() => {
  $('#projects').textContent = 'Projects are unavailable right now. Please refresh the page.'; $('#more').style.display='none';
});
document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click',() => {filter=b.dataset.filter;expanded=false;render();}));
$('#more').addEventListener('click',() => {expanded=true;render();});
$('.close').addEventListener('click',() => dialog.close());
dialog.addEventListener('close',() => document.body.classList.remove('modal-open'));
dialog.addEventListener('click',e => {if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
function step(d){imageIndex=(imageIndex+d+current.images.length)%current.images.length;showImage();}
$('#prev').addEventListener('click',() => step(-1)); $('#next').addEventListener('click',() => step(1));
dialog.addEventListener('keydown',e => {if(e.key==='ArrowRight'){e.preventDefault();step(1);}if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}});

// Holographic surfaces (hero box mark and collector card): tilt toward the pointer (max 13°);
// the foil and glare follow --px/--py and grow with the tilt, then ease back when the pointer leaves.
function holographic(el,area,rest){
 if(!el)return;
 const MAX=13, clamp=n=>Math.min(Math.max(n,0),1);
 const set=(px,py,foil,glare)=>{const v={'--px':px,'--py':py,'--rx':`${((.5-py)*2*MAX).toFixed(2)}deg`,'--ry':`${((px-.5)*2*MAX).toFixed(2)}deg`,'--foil':foil,'--glare':glare};for(const k in v)el.style.setProperty(k,v[k]);};
 area.addEventListener('pointermove',e=>{
  const r=el.getBoundingClientRect(),px=clamp((e.clientX-r.left)/r.width),py=clamp((e.clientY-r.top)/r.height);
  const tilt=Math.min(Math.hypot(px-.5,py-.5)/.5,1);
  el.classList.add('tilting');set(px.toFixed(3),py.toFixed(3),(rest+.15+tilt*.5).toFixed(3),(.25+tilt*.35).toFixed(3));
 });
 const reset=()=>{el.classList.remove('tilting');set(.5,.5,rest,0);};
 area.addEventListener('pointerleave',reset);area.addEventListener('pointercancel',reset);reset();
}
holographic($('.hero-mark'),$('.hero'),.45);
// The grid floor's vanishing point drifts with the pointer.
const hero=$('.hero');
hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();hero.style.setProperty('--gx',((e.clientX-r.left)/r.width).toFixed(3));});
hero.addEventListener('pointerleave',()=>hero.style.setProperty('--gx',.5));
holographic($('.holo-card'),$('.holo-card'),0);

// Photo reel pause control.
const reel=$('.reel');
if(reel)$('.reel-toggle').addEventListener('click',e=>{const paused=reel.classList.toggle('paused');e.currentTarget.setAttribute('aria-pressed',String(paused));e.currentTarget.textContent=paused?'Play':'Pause';});
