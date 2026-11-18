(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const topButton = document.querySelector('.to-top');
  const hero = document.querySelector('.hero');
  const ghosts = [...document.querySelectorAll('.ghost')];
  let pending = false;
  function update(){
    if(topButton) topButton.hidden = scrollY < 700;
    if(hero) hero.style.setProperty('--photo-y', !reduced.matches && innerWidth>1000 ? `${Math.min(scrollY*.04,12)}px`:'0px');
    ghosts.forEach(el=>{const box=el.parentElement.getBoundingClientRect();if(box.bottom>0&&box.top<innerHeight){const p=Math.max(0,Math.min(1,(innerHeight-box.top)/(innerHeight+box.height)));el.style.setProperty('--ghost-y',!reduced.matches&&innerWidth>800?`${35-p*70}px`:'0px');}});
    pending=false;
  }
  addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update);}},{passive:true});
  addEventListener('resize',update,{passive:true});
  reduced.addEventListener('change',update);
  topButton?.addEventListener('click',()=>{window.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'});document.querySelector('.logo')?.focus({preventScroll:true});});
  document.querySelectorAll('.services details').forEach(el=>el.addEventListener('toggle',()=>{if(el.open)document.querySelectorAll(`details[name="${el.name}"]`).forEach(other=>{if(other!==el)other.open=false;});}));
  if('IntersectionObserver'in window){
    const counterObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const el=entry.target;counterObserver.unobserve(el);const goal=Number(el.dataset.count);if(reduced.matches)return;let start;function frame(time){start??=time;const p=Math.min(1,(time-start)/1100);el.textContent=String(Math.round(goal*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(frame);}requestAnimationFrame(frame);}),{threshold:.6});
    document.querySelectorAll('[data-count]').forEach(el=>counterObserver.observe(el));
  }
  update();
})();
