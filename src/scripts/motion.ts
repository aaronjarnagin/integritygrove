/* Site-wide motion, built on GSAP (ScrollTrigger + SplitText).
   Everything here is progressive: with reduced motion (or if this fails to load) the page is fully static and readable.
   Pointer effects (cursor, magnetic buttons, tilt, parallax) only run on devices with a real mouse. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T & Element>(s) as T | null;
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => Array.from(root.querySelectorAll(s)) as T[];

(window as any).__motion = true;
// dev only: lets tests drive GSAP off-screen (gsap.ticker.useRAF(false)); stripped from production builds
if (import.meta.env.DEV) (window as any).gsap = gsap;

if (!reduce) {
  nav();
  progress();
  hero();
  headings();
  reveals();
  counters();
  compare();
  reel();
  marqueeSkew();
  coverReveal();
  if (fine) {
    cursor();
    magnetic();
    tilt();
  }
  // fonts load async and can shift line breaks; re-measure once they're in
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

/* nav hides on scroll down, returns on scroll up */
function nav() {
  const el = $('nav');
  if (!el) return;
  let last = 0;
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate(self) {
      const y = self.scroll();
      const hide = self.direction === 1 && y > 300 && !el.classList.contains('open');
      if (hide !== el.classList.contains('nav-hidden') && Math.abs(y - last) > 6) el.classList.toggle('nav-hidden', hide);
      last = y;
    },
  });
}

/* thin green bar along the top that fills as you read */
function progress() {
  const bar = $('.progress');
  if (!bar) return;
  gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
}

/* hero: headline rises word by word out of masked lines, then the rest; photo stack drops in and floats */
function hero() {
  const h1 = $('.hero h1, .page-head h1, .cs-head h1');
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  if (h1) {
    SplitText.create(h1, {
      type: 'lines,words',
      mask: 'lines',
      linesClass: 'sl',
      autoSplit: true,
      onSplit(self) {
        gsap.set(h1, { opacity: 1 });
        // once the words have landed, put the original headline back so nothing can clip its descenders
        return gsap.from(self.words, { yPercent: 110, duration: 1.1, stagger: 0.06, ease: 'expo.out', onComplete: () => self.revert() });
      },
    });
  }
  const intro = $$('.hero .eyebrow, .hero .lede, .hero .hero-cta-row, .page-head .eyebrow, .page-head .lede, .page-head .hero-cta-row, .page-head .chips, .page-head .contact-cards, .page-head .btn-lg, .cs-head .back, .cs-head .eyebrow, .cs-head .pills');
  if (intro.length) tl.fromTo(intro, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, 0.35);
  const side = $$('.page-head .head-img, .page-head .cform');
  if (side.length) tl.fromTo(side, { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 1.3 }, 0.3);


  const stack = $$('.hero-stack img');
  if (!stack.length) return;
  tl.fromTo(stack,
    { opacity: 0, y: 120, rotate: (i) => [8, -10, 6][i] ?? 0, scale: 0.85 },
    { opacity: 1, y: 0, rotate: (i) => [3, -4, 5][i] ?? 0, scale: 1, duration: 1.5, stagger: 0.12 }, 0.2);

  // scroll: each photo drifts at its own speed
  stack.forEach((img, i) => {
    gsap.to(img, { yPercent: [-18, -40, -65][i] ?? -20, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  });

  // mouse: photos and glow lean toward the cursor, at different depths
  if (!fine) return;
  const hero = $('.hero')!;
  const glow = $('.hero-glow');
  const movers = stack.map((img, i) => ({
    x: gsap.quickTo(img, 'x', { duration: 0.9, ease: 'power3' }),
    y: gsap.quickTo(img, 'y', { duration: 0.9, ease: 'power3' }),
    depth: [18, 34, 52][i] ?? 20,
  }));
  const gx = glow && gsap.quickTo(glow, 'x', { duration: 1.6, ease: 'power3' });
  const gy = glow && gsap.quickTo(glow, 'y', { duration: 1.6, ease: 'power3' });
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    movers.forEach((m) => { m.x(nx * m.depth); m.y(ny * m.depth); });
    if (gx && gy) { gx(e.clientX - r.left - r.width * 0.5); gy(e.clientY - r.top - r.height * 0.5); }
  });
}

/* section headings rise word by word as they scroll in */
function headings() {
  $$('.sec-title h2, .sec-head h2, .cta-band h2').forEach((h) => {
    SplitText.create(h, {
      type: 'lines,words',
      mask: 'lines',
      linesClass: 'sl',
      autoSplit: true,
      onSplit(self) {
        gsap.set(h, { opacity: 1 });
        return gsap.from(self.words, { yPercent: 110, duration: 1, stagger: 0.05, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 85%', once: true }, onComplete: () => self.revert() });
      },
    });
  });
}

/* cards and blocks fade up in staggered batches */
function reveals() {
  gsap.set('.reveal', { opacity: 0, y: 48 });
  ScrollTrigger.batch('.reveal', {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.09, overwrite: true }),
  });
}

/* stats: numbers count up, words scramble into place */
function counters() {
  $$('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const suffix = el.dataset.suffix ?? '';
    const o = { v: 0 };
    gsap.to(o, {
      v: end, duration: 2, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('en-US') + suffix; },
    });
  });
  $$('[data-scramble]').forEach((el) => {
    const final = el.textContent ?? '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const o = { p: 0 };
    gsap.to(o, {
      p: 1, duration: 1.6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onUpdate: () => {
        const n = Math.floor(o.p * final.length);
        el.textContent = final.slice(0, n) + Array.from(final.slice(n), () => chars[(Math.random() * chars.length) | 0]).join('');
      },
      onComplete: () => { el.textContent = final; },
    });
  });
}

/* us vs them: our checks pop in, their list gets struck through */
function compare() {
  const box = $('.compare');
  if (!box) return;
  const tl = gsap.timeline({ scrollTrigger: { trigger: box, start: 'top 70%', once: true } });
  tl.from('.col-us li', { x: -30, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'back.out(2)' })
    .from('.col-them li', { opacity: 0, duration: 0.4, stagger: 0.08 }, 0.1)
    .add(() => box.classList.add('struck'), '+=0.1');
}

/* homepage work reel: pinned, scrolls sideways on desktop; native swipe carousel everywhere else */
function reel() {
  const section = $('.reel');
  const track = $('.reel-track');
  if (!section || !track) return;
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    section.classList.add('reel-pinned');
    const count = $('.reel-count b');
    const cards = $$('.reel-card:not(.reel-more)', track);
    const distance = () => track.scrollWidth - track.clientWidth;
    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + distance(),
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate(self) {
          if (count) count.textContent = String(Math.min(cards.length, Math.floor(self.progress * (cards.length - 1) + 1.5))).padStart(2, '0');
        },
      },
    });
    return () => section.classList.remove('reel-pinned');
  });
}

/* big CTA marquee leans into fast scrolling, then springs back upright when scrolling stops */
function marqueeSkew() {
  const els = $$('.big-marquee .marquee-set');
  if (!els.length) return;
  const skew = gsap.quickTo(els, 'skewX', { duration: 0.5, ease: 'power3' });
  let settle: ReturnType<typeof setTimeout>;
  ScrollTrigger.create({
    onUpdate(self) {
      skew(gsap.utils.clamp(-14, 14, self.getVelocity() / -250));
      clearTimeout(settle);
      settle = setTimeout(() => skew(0), 120);
    },
  });
}

/* case study cover wipes open */
function coverReveal() {
  const cover = $('.cs-cover');
  if (!cover) return;
  gsap.fromTo(cover, { clipPath: 'inset(12% 8% 12% 8% round 16px)' }, { clipPath: 'inset(0% 0% 0% 0% round 16px)', duration: 1.6, ease: 'expo.out', delay: 0.3 });
  const img = $('img', cover);
  if (img) gsap.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 2, ease: 'expo.out', delay: 0.3 });
}

/* cursor follower: grows with a label over work, shrinks over links */
function cursor() {
  const c = $('.cursor');
  const label = $('.cursor-label');
  if (!c || !label) return;
  document.documentElement.classList.add('has-cursor');
  const x = gsap.quickTo(c, 'x', { duration: 0.35, ease: 'power3' });
  const y = gsap.quickTo(c, 'y', { duration: 0.35, ease: 'power3' });
  addEventListener('pointermove', (e) => { x(e.clientX); y(e.clientY); c.classList.add('on'); });
  document.addEventListener('pointerleave', () => c.classList.remove('on'));
  document.addEventListener('pointerover', (e) => {
    const t = e.target as Element;
    const big = t.closest('.work-card, .reel-card, .yt-btn');
    const link = t.closest('a, button, select, input, textarea, label');
    c.classList.toggle('big', !!big);
    c.classList.toggle('link', !big && !!link);
    label.textContent = big ? (big.classList.contains('yt-btn') ? 'Play' : 'View') : '';
  });
}

/* buttons pull toward the cursor and spring back */
function magnetic() {
  $$('.btn').forEach((b) => {
    const x = gsap.quickTo(b, 'x', { duration: 0.4, ease: 'power3' });
    const y = gsap.quickTo(b, 'y', { duration: 0.4, ease: 'power3' });
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.35);
      y((e.clientY - r.top - r.height / 2) * 0.35);
    });
    b.addEventListener('pointerleave', () => {
      gsap.to(b, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)', overwrite: true });
    });
  });
}

/* cards tilt in 3D and a spotlight follows the cursor across them */
function tilt() {
  $$('.service, .package, .work-card, .review, .contact-card, .person').forEach((card) => {
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3' });
    gsap.set(card, { transformPerspective: 900 });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      rx((0.5 - py) * 8);
      ry((px - 0.5) * 10);
      card.style.setProperty('--mx', px * 100 + '%');
      card.style.setProperty('--my', py * 100 + '%');
    });
    card.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });
}
