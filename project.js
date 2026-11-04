'use strict';
// Project page: renders project.html?p=<slug> from projects.json.
(() => {
  const $ = s => document.querySelector(s);
  const el = (tag,props={}) => Object.assign(document.createElement(tag),props);
  const slug = new URLSearchParams(location.search).get('p');
  const fail = message => {$('#title').textContent = message;$('#title').classList.add('rise');window.initRise($('#title'));};
  fetch('projects.json').then(r => {if(!r.ok) throw Error('Content unavailable');return r.json();}).then(projects => {
    const i = projects.findIndex(p => p.slug === slug);
    if (i < 0) {fail('Project not found.');return;}
    const p = projects[i];
    document.title = `${p.title} — theLOOP`;
    document.querySelector('meta[name="description"]').content = p.text.split('\n')[0].slice(0,160);
    $('#category').textContent = p.category.toUpperCase();
    $('#title').textContent = p.title; $('#title').classList.add('rise'); window.initRise($('#title'));
    $('#text').textContent = p.text;
    Object.entries(p.fields).filter(([,v]) => v).forEach(([key,value]) => {
      const row = el('div'); row.append(el('dt',{textContent:key}),el('dd',{textContent:value})); $('#fields').append(row);
    });
    const [cover,...rest] = p.images;
    if (cover) {$('#cover img').src = cover;$('#cover img').alt = p.title;$('#cover').hidden = false;}
    rest.forEach((src,n) => $('#gallery').append(el('img',{src,alt:`${p.title} — ${n + 2}`,loading:'lazy',decoding:'async'})));
    if (!rest.length) $('#gallery').hidden = true;
    const link = (q,label) => {const a = el('a',{href:`project.html?p=${encodeURIComponent(q.slug)}`});a.append(el('small',{textContent:label}),el('b',{textContent:q.title}));return a;};
    $('#pager').append(link(projects[(i - 1 + projects.length) % projects.length],'← PREVIOUS PROJECT'),link(projects[(i + 1) % projects.length],'NEXT PROJECT →'));
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }).catch(() => fail('Project unavailable.'));
})();
