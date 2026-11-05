'use strict';
// News page: renders the announcements in news.json, newest first. To publish an update, add an entry
// ({date:'YYYY-MM-DD', category, title, text, image?, link?:{href,label}}); order in the file doesn't matter.
(() => {
  const $ = s => document.querySelector(s);
  const el = (tag,props={}) => Object.assign(document.createElement(tag),props);
  const fmt = new Intl.DateTimeFormat('en',{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'});
  fetch('news.json').then(r => {if(!r.ok) throw Error('Content unavailable');return r.json();}).then(items => {
    items.sort((a,b) => b.date.localeCompare(a.date)).forEach(n => {
      const time = el('time',{dateTime:n.date,textContent:fmt.format(new Date(n.date))});
      const body = el('div'); body.append(el('p',{className:'origin',textContent:n.category}),el('h3',{textContent:n.title}),el('p',{textContent:n.text}));
      if (n.link) body.append(el('a',{className:'text-link',href:n.link.href,textContent:`${n.link.label} →`}));
      const photo = el('div',{className:'news-photo'});
      if (n.image) photo.append(el('img',{src:n.image,alt:n.title,loading:'lazy',decoding:'async'})); else photo.hidden = true;
      const item = el('article',{className:'news-item'}); item.append(time,body,photo); $('#newsList').append(item);
    });
    if (!items.length) $('#newsList').append(el('p',{className:'prose',textContent:'No announcements yet.'}));
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }).catch(() => $('#newsList').append(el('p',{className:'prose',textContent:'News unavailable.'})));
})();
