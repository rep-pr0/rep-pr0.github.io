(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const compactViewport = matchMedia('(max-width: 900px)');
  document.querySelectorAll('[data-team-scene]').forEach(scene => {
    if (scene.dataset.teamReady === 'true') return;
    const buttons = [...scene.querySelectorAll('[data-team-role]')];
    const outputs = [...scene.querySelectorAll('[data-team-result]')];
    const lines = [...scene.querySelectorAll('[data-team-line]')];
    const resultLink = scene.querySelector('[data-team-result-link]');
    const play = scene.querySelector('[data-team-play]');
    const status = scene.querySelector('[data-team-status]');
    if (!buttons.length || !outputs.length || !play) return;
    let active = 0;
    let automatic = !reducedMotion.matches && !compactViewport.matches;
    let visible = !('IntersectionObserver' in window);
    let hovered = false;
    let focused = false;
    let timer;
    const interval = 5500;
    const setActive = (index, announce = false) => {
      active = (index + buttons.length) % buttons.length;
      const role = buttons[active].dataset.teamRole;
      buttons.forEach(button => {
        const selected = button.dataset.teamRole === role;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      outputs.forEach(output => output.classList.toggle('is-active', output.dataset.teamResult === role));
      lines.forEach(line => line.classList.toggle('is-active', line.dataset.teamLine === role));
      if (resultLink) {
        const sourceY = [28, 94, 159, 225, 291, 356, 422][active];
        resultLink.setAttribute('d', `M625 ${sourceY}C655 ${sourceY} 650 225 685 225`);
      }
      if (announce && status) status.textContent = `${buttons[active].textContent.trim()}: ${outputs.find(output => output.dataset.teamResult === role).querySelector('h3').textContent}`;
      if (announce && matchMedia('(max-width: 900px)').matches) {
        requestAnimationFrame(() => {
          const selectedOutput = outputs.find(output => output.dataset.teamResult === role);
          const bounds = selectedOutput.getBoundingClientRect();
          if (bounds.top < 16 || bounds.bottom > window.innerHeight - 16) {
            selectedOutput.scrollIntoView({behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'nearest'});
          }
        });
      }
      scene.classList.remove('is-auto');
      if (automatic && visible && !document.hidden && !hovered && !focused && !reducedMotion.matches) {
        // Restart the thin interval indicator for the newly selected role.
        void scene.offsetWidth;
        scene.classList.add('is-auto');
      }
    };
    const sync = () => {
      clearTimeout(timer);
      const running = automatic && visible && !document.hidden && !hovered && !focused && !reducedMotion.matches;
      scene.classList.toggle('is-paused', !running);
      play.setAttribute('aria-pressed', String(!automatic));
      play.textContent = automatic ? 'Приостановить показ' : 'Включить автопоказ';
      if (running) {
        scene.classList.remove('is-auto');
        void scene.offsetWidth;
        scene.classList.add('is-auto');
        timer = setTimeout(() => {setActive(active + 1); sync();}, interval);
      }
    };
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => {automatic = false; setActive(index, true); sync();});
      button.addEventListener('keydown', event => {
        let indexToFocus;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') indexToFocus = index + 1;
        if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') indexToFocus = index - 1;
        if (event.key === 'Home') indexToFocus = 0;
        if (event.key === 'End') indexToFocus = buttons.length - 1;
        if (indexToFocus !== undefined) {
          event.preventDefault();
          automatic = false;
          const next = (indexToFocus + buttons.length) % buttons.length;
          buttons[next].focus();
          setActive(next, true);
          sync();
        }
      });
    });
    const roleZone = scene.querySelector('.team-canvas');
    play.addEventListener('click', () => {automatic = !automatic; sync();});
    roleZone.addEventListener('pointerenter', event => {if(event.pointerType === 'mouse'){hovered=true;sync();}});
    roleZone.addEventListener('pointerleave', () => {hovered=false;sync();});
    roleZone.addEventListener('focusin', () => {focused=true;sync();});
    roleZone.addEventListener('focusout', event => {if(!roleZone.contains(event.relatedTarget)){focused=false;sync();}});
    document.addEventListener('visibilitychange', sync);
    reducedMotion.addEventListener('change', () => {if(reducedMotion.matches)automatic=false;sync();});
    compactViewport.addEventListener('change', () => {if(compactViewport.matches)automatic=false;sync();});
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {visible=entries[0].isIntersecting;sync();},{threshold:.2}).observe(scene);
    scene.dataset.teamReady = 'true';
    scene.classList.add('is-enhanced');
    setActive(0);
    sync();
  });
})();
