/* Lama Lama — local replication study (personal learning only) */
(function () {
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis smooth scroll ---------- */
  const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ---------- Amsterdam clock ---------- */
  const clockEls = document.querySelectorAll('.js-clock');
  const fmt = new Intl.DateTimeFormat('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  function tick() {
    const parts = fmt.formatToParts(new Date());
    const g = (type) => parts.find(p => p.type === type).value;
    const s = `${g('hour')} : ${g('minute')} : ${g('second')}`;
    clockEls.forEach(el => { el.textContent = s; });
  }
  tick(); setInterval(tick, 1000);

  /* ---------- Word splitting ---------- */
  document.querySelectorAll('[data-words]').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(' ');
  });

  /* ---------- Preloader ---------- */
  const pre = document.getElementById('preloader');
  const pct = document.getElementById('preloaderPct');
  const counter = { v: 0 };
  const intro = gsap.timeline();
  intro
    .to(counter, {
      v: 100, duration: 1.5, ease: 'power2.inOut',
      onUpdate: () => { pct.textContent = Math.round(counter.v) + '%'; }
    })
    .to(pre, { yPercent: -100, duration: .8, ease: 'power4.inOut' }, '+=0.15')
    .set(pre, { display: 'none' })
    .from('.hero__title .line > span', {
      yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: .09
    }, '-=0.55')
    .from('.hero__tag', { opacity: 0, y: 10, duration: .6 }, '-=0.7')
    .from('.metabar--hero > *', { opacity: 0, y: 12, duration: .6, stagger: .05 }, '-=0.6')
    .from('.navpill', { y: -24, opacity: 0, duration: .7, ease: 'power3.out' }, '-=0.8')
    .fromTo('.rail > *',
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: .6, stagger: .07, clearProps: 'opacity,transform' }, '-=0.7')
    .add(() => { heroParaReveal(); });

  /* hero paragraph word reveal shortly after intro */
  function heroParaReveal() {
    const words = document.querySelectorAll('.hero__para .w');
    gsap.to(words, { opacity: 1, duration: .5, stagger: .022, ease: 'none' });
  }

  /* ---------- Scroll word reveals (scrub) ---------- */
  document.querySelectorAll('[data-words]:not(.hero__para)').forEach((el) => {
    const words = el.querySelectorAll('.w');
    gsap.to(words, {
      opacity: 1, ease: 'none', stagger: .06,
      scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 35%', scrub: true }
    });
  });

  /* ---------- Hero scroll-out: video dims, halftone dots rise ---------- */
  gsap.to('.hero__dots', {
    opacity: 1, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: '40% top', end: 'bottom top', scrub: true }
  });
  gsap.to('.hero__video', {
    opacity: .25, scale: 1.06, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  /* ---------- Nav label rotation per section ---------- */
  const navpill = document.getElementById('navpill');
  const labelBox = document.getElementById('navLabel');
  const labelSpan = labelBox.querySelector('span');
  const decode = (s) => { const d = document.createElement('div'); d.innerHTML = s; return d.textContent; };

  let labels = ['LET’S DO DAMAGE'];
  let labelIdx = 0, labelTimer = null;

  function setLabel(text, animate = true) {
    if (!animate) { labelSpan.textContent = text; return; }
    gsap.to(labelSpan, {
      yPercent: -110, duration: .35, ease: 'power2.in', onComplete: () => {
        labelSpan.textContent = text;
        gsap.fromTo(labelSpan, { yPercent: 110 }, { yPercent: 0, duration: .35, ease: 'power2.out' });
      }
    });
  }

  function startRotation() {
    clearInterval(labelTimer);
    labelTimer = setInterval(() => {
      labelIdx = (labelIdx + 1) % labels.length;
      setLabel(labels[labelIdx]);
    }, 3200);
  }

  function setSection(section) {
    const raw = section.dataset.labels;
    if (!raw) return;
    labels = raw.split('|').map(decode);
    labelIdx = Math.floor(Math.random() * labels.length);
    setLabel(labels[labelIdx]);
    startRotation();
    navpill.classList.toggle('is-checker', section.dataset.logo === 'checker');
  }

  document.querySelectorAll('[data-labels]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec, start: 'top 55%', end: 'bottom 55%',
      onEnter: () => setSection(sec),
      onEnterBack: () => setSection(sec)
    });
  });
  startRotation();

  /* ---------- Burger menu ---------- */
  const burger = document.getElementById('burger');
  const menublur = document.getElementById('menublur');
  const navmenu = document.getElementById('navmenu');
  const menuItems = navmenu.querySelectorAll('.navmenu__item, .navmenu__actions');

  function toggleMenu(force) {
    const open = force !== undefined ? force : !navpill.classList.contains('is-open');
    navpill.classList.toggle('is-open', open);
    menublur.classList.toggle('is-on', open);
    navmenu.setAttribute('aria-hidden', String(!open));
    if (open) {
      lenis.stop();
      gsap.fromTo(menuItems,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: .5, stagger: .06, delay: .1, ease: 'power3.out', overwrite: true });
    } else {
      lenis.start();
    }
  }
  burger.addEventListener('click', () => toggleMenu());
  menublur.addEventListener('click', () => toggleMenu(false));
  navmenu.querySelectorAll('[data-close]').forEach(a =>
    a.addEventListener('click', () => toggleMenu(false)));

  const subtoggle = document.getElementById('subtoggle');
  subtoggle.addEventListener('click', () => {
    subtoggle.closest('.navmenu__item--sub').classList.toggle('open');
  });

  /* open pitchdeck rail from menu button */
  document.querySelectorAll('[data-rail-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleMenu(false);
      const item = document.querySelector(`.rail__item[data-rail="${btn.dataset.railOpen}"]`);
      if (item && !item.classList.contains('open')) item.querySelector('.rail__head').click();
    });
  });

  /* ---------- Work accordion ---------- */
  document.querySelectorAll('[data-case]').forEach((caseEl) => {
    const toggle = caseEl.querySelector('[data-case-toggle]');
    const panel = caseEl.querySelector('.case__panel');
    toggle.addEventListener('click', () => {
      const isOpen = caseEl.classList.contains('open');
      // close others
      document.querySelectorAll('[data-case].open').forEach(other => {
        if (other !== caseEl) {
          other.classList.remove('open');
          other.querySelector('.case__panel').style.maxHeight = '0px';
        }
      });
      caseEl.classList.toggle('open', !isOpen);
      panel.style.maxHeight = !isOpen ? panel.scrollHeight + 'px' : '0px';
      setTimeout(() => ScrollTrigger.refresh(), 750);
    });
  });

  /* keep open panel height correct on resize */
  window.addEventListener('resize', () => {
    document.querySelectorAll('[data-case].open .case__panel').forEach(p => {
      p.style.maxHeight = p.scrollHeight + 'px';
    });
  });

  /* ---------- Rail accordions ---------- */
  document.querySelectorAll('.rail__item').forEach((item) => {
    const head = item.querySelector('.rail__head');
    head.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      const vid = item.querySelector('video');
      if (vid) { open ? vid.play().catch(() => {}) : vid.pause(); }
    });
  });

  /* ---------- Section fades ---------- */
  gsap.utils.toArray('.case, .services__col, .culture__img').forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 30, duration: .9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%' }
    });
  });

  /* ---------- Anchor smooth scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        lenis.scrollTo(id, { offset: 0, duration: 1.4 });
      } else {
        e.preventDefault();
      }
    });
  });
})();
