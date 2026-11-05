'use strict';
// Shared by every page: mobile navigation and the Split Rise title animation.
(() => {
  const nav = document.querySelector('nav'), toggle = document.querySelector('#menuToggle');
  const setMenu = open => {nav.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'Close −':'Menu +';};
  if (nav && toggle) {
    toggle.addEventListener('click',() => setMenu(!nav.classList.contains('open')));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click',() => setMenu(false)));
  }
})();

// Split Rise: each title is split into characters inside clipping masks; they rise from below
// (0.06s apart, strong ease-out) the first time the title scrolls in, and stay in place afterwards.
window.initRise = (() => {
  const ready = window.gsap && window.SplitText && window.ScrollTrigger;
  if (ready) gsap.registerPlugin(SplitText,ScrollTrigger);
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  return el => {
    if (!ready) {el.classList.add('risen');return;}
    fonts.then(() => {
      const split = SplitText.create(el,{type:'words,chars',mask:'chars',charsClass:'char'}), chars = split.chars;
      gsap.set(chars,{yPercent:110}); el.classList.add('risen');
      ScrollTrigger.create({trigger:el,start:'top 90%',once:true,
        onEnter:() => gsap.to(chars,{yPercent:0,duration:1.15,ease:'power4.out',stagger:.06})});
    });
  };
})();
document.querySelectorAll('.rise').forEach(window.initRise);
