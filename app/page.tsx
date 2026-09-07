'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DISPLAY, type PriceDisplay } from '@/lib/pricing';

const S = `
/* Single-theme by intent: this is a night-time world. Every colour painted explicitly. */
:root{
  --ink:#0B0D1C; --ink-2:#161A2E; --ink-3:#212642;
  --txt:#F6EFE4; --txt-dim:#B7B2C4; --txt-mute:#7C7893;
  --amber:#FFB765; --amber-hi:#FFDCA8; --amber-lo:#E8913A;
  --orange:#FF7A45; --teal:#45BFCB; --violet:#9A8BFF; --pink:#FF8FB8; --green:#7CC97C;
  --cream:#FCF5EA; --navy:#0D183D; --cocoa:#4A3A28; --cocoa-dim:#77654E;
  --r-sm:16px; --r:22px; --r-lg:32px; --r-xl:42px;
  --sh-1:0 1px 2px rgba(4,6,16,.20),0 4px 10px rgba(4,6,16,.16),0 10px 24px rgba(4,6,16,.14);
  --sh-2:0 2px 4px rgba(4,6,16,.20),0 8px 20px rgba(4,6,16,.18),0 20px 44px rgba(4,6,16,.22),0 40px 80px rgba(4,6,16,.18);
  --sh-3:0 2px 6px rgba(4,6,16,.22),0 12px 30px rgba(4,6,16,.22),0 32px 70px rgba(4,6,16,.28),0 64px 120px rgba(4,6,16,.24);
  --ease:cubic-bezier(.34,.82,.28,1);
  --s--1:clamp(.86rem,.83rem + .14vw,.95rem);
  --s-0:clamp(1.02rem,.99rem + .17vw,1.11rem);
  --s-1:clamp(1.18rem,1.1rem + .38vw,1.4rem);
  --s-2:clamp(1.5rem,1.3rem + .9vw,2.1rem);
  --s-3:clamp(1.95rem,1.55rem + 2vw,3.2rem);
  --s-4:clamp(2.3rem,1.6rem + 3.3vw,4.4rem);
  --pad:clamp(20px,5vw,64px); --maxw:1240px;
}
*{box-sizing:border-box}
html{scroll-behavior:auto}
body{
  margin:0;background:var(--ink);color:var(--txt);
  font-family:'Nunito',system-ui,-apple-system,sans-serif;
  font-size:var(--s-0);line-height:1.66;font-weight:500;
  -webkit-font-smoothing:antialiased;overflow-x:hidden;
}
body::after{
  content:"";position:fixed;inset:-50%;z-index:300;pointer-events:none;
  opacity:.15;mix-blend-mode:soft-light;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.86' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E");
}
h1,h2,h3,h4{font-family:'Baloo 2','Nunito',sans-serif;font-weight:700;line-height:1.12;letter-spacing:-.005em;margin:0;text-wrap:balance}
p{margin:0} a{color:inherit;text-decoration:none} img{display:block;max-width:100%}
button{font:inherit;cursor:pointer;border:0;background:none;color:inherit}
:focus-visible{outline:2px solid var(--amber);outline-offset:4px;border-radius:10px}
.wrap{max-width:var(--maxw);margin:0 auto;padding-inline:var(--pad)}

/* ---------- buttons ---------- */
.btn{position:relative;isolation:isolate;display:inline-flex;align-items:center;justify-content:center;gap:.6em;
  padding:1em 1.75em;border-radius:999px;font-family:'Baloo 2',sans-serif;font-weight:700;font-size:var(--s-0);line-height:1.15;
  transition:transform .45s var(--ease),box-shadow .45s var(--ease)}
.btn::before{content:"";position:absolute;inset:0;border-radius:inherit;z-index:-1;
  background:radial-gradient(120% 78% at 50% -12%,rgba(255,255,255,.42),rgba(255,255,255,0) 62%)}
.btn-primary{background:linear-gradient(176deg,#FFC183 0%,#FF9553 30%,#FF7A45 66%,#EE5F26 100%);color:#42190A;
  box-shadow:inset 0 2px 0 rgba(255,246,232,.62),inset 0 -3px 8px rgba(150,52,10,.30),
   0 1px 2px rgba(90,32,6,.22),0 6px 14px rgba(160,58,16,.26),0 16px 34px rgba(160,58,16,.28),0 32px 64px rgba(120,40,8,.26)}
.btn-primary:hover{transform:translateY(-3px)}
.btn-ghost{color:var(--txt);background:linear-gradient(174deg,rgba(255,240,222,.11),rgba(255,240,222,.04));
  backdrop-filter:blur(16px) saturate(150%);
  box-shadow:inset 0 1px 0 rgba(255,241,222,.24),inset 0 0 0 1px rgba(255,231,203,.10),
   0 2px 6px rgba(4,6,16,.22),0 10px 26px rgba(4,6,16,.22)}
.btn-ghost:hover{transform:translateY(-2px);background:linear-gradient(174deg,rgba(255,240,222,.18),rgba(255,240,222,.07))}
.btn-lg{padding:1.15em 2.1em;font-size:var(--s-1)}

/* ---------- chrome ---------- */
header.nav{position:fixed;inset:0 0 auto;z-index:120;transition:background .6s var(--ease),backdrop-filter .6s,box-shadow .6s}
header.nav.stuck{background:linear-gradient(180deg,rgba(11,13,28,.86),rgba(11,13,28,.62));
  backdrop-filter:blur(24px) saturate(165%);
  box-shadow:0 1px 0 rgba(255,231,203,.07),0 12px 34px rgba(4,6,16,.34)}
.nav-in{display:flex;align-items:center;gap:clamp(12px,2.4vw,26px);height:72px}
.logo{margin-right:auto;display:flex;align-items:center}
/* the real brand artwork, reversed with transparency for the dark ground */
.logo img{height:31px;width:auto;display:block;filter:drop-shadow(0 3px 12px rgba(4,6,16,.6))}
@media(max-width:520px){.logo img{height:26px}}
.brandmark{display:block;margin:0 auto clamp(26px,4vw,44px);width:min(380px,72vw);height:auto;
  filter:drop-shadow(0 6px 22px rgba(4,6,16,.5))}

/* stacked lockup for the footer, where it has space to be read properly */
.lockup{display:block}
.lockup img{width:min(258px,68vw);height:auto;display:block;
  filter:drop-shadow(0 5px 18px rgba(4,6,16,.5))}
.nav-links{display:flex;gap:clamp(12px,2vw,26px);font-size:var(--s--1);font-weight:700;color:var(--txt-dim)}
.nav-links a:hover{color:var(--txt)}
@media(max-width:980px){.nav-links{display:none}}

/* ---------- the journey ---------- */
.journey{position:relative;height:760vh}
.stage{position:sticky;top:0;height:100vh;overflow:hidden;isolation:isolate}
#depth-canvas,.bgimg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;will-change:transform,opacity}
.bgimg{z-index:1;opacity:0}
/* the canvas re-renders every plate with real depth; the imgs below are the fallback */
#depth-canvas{z-index:3;opacity:0;transition:opacity 1s var(--ease)}
#depth-canvas.live{opacity:1}
.scrim{position:absolute;inset:0;z-index:6;pointer-events:none;
  background:radial-gradient(120% 78% at 50% 88%,rgba(255,150,70,.14),transparent 60%),
  linear-gradient(180deg,rgba(11,13,28,.80) 0%,rgba(11,13,28,.20) 26%,rgba(11,13,28,.34) 56%,rgba(11,13,28,.86) 92%,var(--ink) 100%)}
#dust{position:absolute;inset:0;z-index:7;pointer-events:none}

/* portals flying past */
.portals{position:absolute;inset:0;z-index:5;perspective:1100px;pointer-events:none;opacity:0}
.portal{position:absolute;left:50%;top:50%;width:clamp(200px,22vw,300px);aspect-ratio:3/4.06;
  margin:0 0 0 0;border-radius:var(--r-lg);overflow:hidden;will-change:transform,opacity;
  box-shadow:inset 0 0 0 1px rgba(255,220,168,.22),0 20px 60px rgba(4,6,16,.5),0 0 90px rgba(255,170,80,.10)}
.portal img{width:100%;height:100%;object-fit:cover}
.portal span{position:absolute;inset:auto 0 0;padding:14px 16px;font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1.02rem;
  background:linear-gradient(180deg,transparent,rgba(6,8,18,.9));text-shadow:0 2px 12px rgba(6,8,18,.8)}

/* beat copy */
.beats{position:absolute;inset:0;z-index:20;display:grid;pointer-events:none}
.beat{grid-area:1/1;display:grid;align-content:center;opacity:0;will-change:opacity,transform;position:relative;isolation:isolate}
.beat > .wrap{width:100%}
.beat.live{pointer-events:auto}
.kick{font-size:.76rem;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--amber);
  display:flex;align-items:center}
.beat h1{font-size:var(--s-4);max-width:19ch;margin-top:1rem;text-shadow:0 2px 20px rgba(8,6,20,.6),0 8px 60px rgba(8,6,20,.45)}
.beat h2{font-size:var(--s-3);max-width:19ch;margin-top:1rem;text-shadow:0 2px 20px rgba(8,6,20,.6)}
.beat h1 em,.beat h2 em{font-style:normal;
  background:linear-gradient(94deg,#FFCE8A 0%,#FFA94F 38%,#FF7A45 78%,#FF6533 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 2px 10px rgba(60,20,0,.55)) drop-shadow(0 4px 28px rgba(255,130,50,.4))}
.beat p.lead{font-size:var(--s-1);color:var(--txt-dim);max-width:46ch;margin-top:1.1rem;line-height:1.56;
  text-shadow:0 2px 16px rgba(8,6,20,.65)}
.acts{display:flex;flex-wrap:wrap;gap:.85rem;margin-top:1.9rem}
.mini{display:flex;flex-wrap:wrap;gap:.5rem 1.5rem;margin-top:1.5rem;font-size:var(--s--1);font-weight:700;color:var(--txt-dim)}
.mini span{display:flex;align-items:center;gap:.45em}
.tick{width:16px;height:16px;flex:none;color:var(--teal)}
.beat.mid{text-align:center}
.beat.top{align-content:start;padding-top:clamp(92px,14vh,150px)}
.beat.top::before{content:"";position:absolute;inset:0 0 auto;height:52vh;pointer-events:none;z-index:-1;
  background:linear-gradient(180deg,rgba(9,11,24,.80) 0%,rgba(9,11,24,.55) 46%,transparent 100%)}
.beat.mid h2{max-width:22ch;margin-inline:auto}
.beat.mid .kick{justify-content:center}
.beat.mid p.lead{margin-inline:auto}

/* name card */
.namecard{max-width:520px;border-radius:var(--r-lg);padding:clamp(22px,2.5vw,30px);margin-top:1.6rem;
  background:linear-gradient(168deg,rgba(38,44,74,.74),rgba(15,18,36,.82));backdrop-filter:blur(30px) saturate(150%);
  box-shadow:inset 0 1px 0 rgba(255,241,222,.20),inset 0 0 0 1px rgba(255,231,203,.09),
   inset 0 -30px 60px rgba(6,8,20,.28),var(--sh-3)}
.namecard label{display:block;font-size:.74rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--txt-mute);margin-bottom:.7rem}
.namecard input{width:100%;padding:.95em 1.15em;border-radius:var(--r);font:inherit;font-weight:700;border:0;
  background:rgba(9,11,24,.5);color:var(--txt);
  box-shadow:inset 0 2px 5px rgba(4,6,16,.45),inset 0 0 0 1px rgba(255,231,203,.11);transition:box-shadow .35s,background .35s}
.namecard input::placeholder{color:var(--txt-mute);font-weight:600}
.namecard input:focus{outline:none;background:rgba(9,11,24,.34);
  box-shadow:inset 0 2px 5px rgba(4,6,16,.34),inset 0 0 0 1px rgba(255,183,101,.55),0 0 0 5px rgba(255,183,101,.12)}
.namecard .out{margin-top:1.15rem;padding:1.1rem 1.2rem;border-radius:var(--r);text-align:left;
  background:linear-gradient(168deg,rgba(255,183,101,.10),rgba(255,183,101,.04));
  box-shadow:inset 0 1px 0 rgba(255,241,222,.14),inset 3px 0 0 var(--amber);
  font-size:1.02rem;line-height:1.66;color:#EFE6D8}
.namecard .out b{color:var(--amber-hi);font-weight:800}

/* the page spread */
.spreadwrap{display:grid;place-items:center}
.spread{position:relative;width:min(900px,84vw);border-radius:var(--r-lg);overflow:hidden;display:grid;grid-template-columns:1fr 1fr;
  background:#fff;aspect-ratio:16/10.6;box-shadow:0 20px 60px rgba(0,0,0,.55),0 60px 130px rgba(0,0,0,.5)}
@media(max-width:640px){.spread{grid-template-columns:1fr;aspect-ratio:4/5}.spread .spread-img{order:-1}}
.spread::before{content:"";position:absolute;left:50%;top:0;bottom:0;width:40px;transform:translateX(-50%);z-index:3;
  background:linear-gradient(90deg,rgba(120,90,60,0),rgba(120,90,60,.10) 40%,rgba(90,66,42,.20) 50%,rgba(120,90,60,.10) 60%,rgba(120,90,60,0))}
.spread-txt{padding:clamp(16px,2.4vw,34px);display:flex;flex-direction:column;justify-content:center;
  background:linear-gradient(120deg,#FFFDF9,#FBF4E9);color:#463724}
.spread-txt p{font-size:clamp(.74rem,1vw,.94rem);line-height:1.72;font-weight:500}
.spread-txt p+p{margin-top:.75em}
.dropcap::first-letter{font-family:'Baloo 2',sans-serif;font-size:3em;float:left;line-height:.9;padding:.04em .1em 0 0;color:var(--orange);font-weight:700}
.pgnum{margin-top:1em;font-size:.66rem;letter-spacing:.1em;color:#AB9779;font-weight:800}
.spread-img{position:relative;overflow:hidden}
.spread-img img{width:100%;height:100%;object-fit:cover}

/* quote */
.qwrap{max-width:34ch;text-align:center;margin-inline:auto}
.qwrap blockquote{font-family:'Baloo 2',sans-serif;font-size:var(--s-2);line-height:1.38;font-weight:500;margin:0;
  text-shadow:0 2px 24px rgba(6,8,18,.75)}
.qwrap blockquote b{font-weight:700;color:var(--amber-hi)}
.stars{display:flex;gap:.26rem;justify-content:center;color:var(--amber);margin-bottom:1.3rem;filter:drop-shadow(0 2px 10px rgba(255,150,60,.4))}
.byline{margin-top:1.5rem;font-size:var(--s--1);color:var(--txt-dim);font-weight:800}
.byline i{display:block;font-style:normal;color:var(--txt-mute);font-weight:600;margin-top:.2rem}

/* progress rail */
.rail{position:fixed;right:clamp(10px,1.6vw,22px);top:50%;transform:translateY(-50%);z-index:110;
  display:grid;gap:11px;pointer-events:none}
@media(max-width:760px){.rail{display:none}}
.rail i{width:7px;height:7px;border-radius:50%;background:rgba(255,231,203,.22);transition:background .4s,transform .4s,box-shadow .4s}
.rail i.on{background:var(--amber);transform:scale(1.5);box-shadow:0 0 14px rgba(255,183,101,.7)}

.cue{position:absolute;left:50%;bottom:26px;transform:translateX(-50%);z-index:25;
  font-size:.74rem;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--txt-mute);
  display:flex;flex-direction:column;align-items:center;gap:.5rem;transition:opacity .6s}
.cue svg{animation:bob 2.4s var(--ease) infinite}
@keyframes bob{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(7px);opacity:1}}

/* ---------- released sections ---------- */
.sec{padding-block:clamp(76px,11vw,150px);position:relative}
.journey + .sec{padding-top:clamp(110px,13vw,180px)}
.sec-head{max-width:36ch;margin-inline:auto;text-align:center}
.sec-head h2{font-size:var(--s-3);margin-top:1rem}
.sec-head p{margin-top:1.05rem;color:var(--txt-dim);font-size:var(--s-1);line-height:1.56}
.sec-head .kick{justify-content:center}
.price-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:clamp(18px,2.2vw,26px);margin-top:clamp(42px,5vw,64px);max-width:900px;margin-inline:auto}
@media(max-width:780px){.price-grid{grid-template-columns:1fr}}
.plan{position:relative;border-radius:var(--r-xl);padding:clamp(28px,3vw,40px);
  background:linear-gradient(172deg,rgba(45,52,86,.5),rgba(17,20,38,.62));
  box-shadow:inset 0 1px 0 rgba(255,241,222,.15),inset 0 0 0 1px rgba(255,231,203,.07),inset 0 -50px 90px rgba(6,8,20,.24),var(--sh-1);
  transition:transform .55s var(--ease),box-shadow .55s var(--ease)}
.plan:hover{transform:translateY(-5px);box-shadow:inset 0 1px 0 rgba(255,241,222,.2),inset 0 0 0 1px rgba(255,231,203,.1),var(--sh-2)}
.plan.best{background:linear-gradient(172deg,rgba(66,58,74,.55),rgba(24,22,42,.66));
  box-shadow:inset 0 1px 0 rgba(255,225,180,.28),inset 0 0 0 1px rgba(255,183,101,.28),inset 0 -50px 90px rgba(6,8,20,.22),
   0 2px 8px rgba(4,6,16,.22),0 14px 40px rgba(140,70,20,.2),0 40px 90px rgba(120,60,16,.22)}
.plan-tag{position:absolute;top:-13px;left:clamp(28px,3vw,40px);font-size:.68rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;
  padding:.5em 1em;border-radius:999px;color:#4A2404;background:linear-gradient(176deg,var(--amber-hi),var(--amber) 60%,var(--amber-lo));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 3px 8px rgba(120,60,10,.3),0 10px 22px rgba(120,60,10,.24)}
.plan h3{font-size:var(--s-1)}
.plan-sub{font-size:var(--s--1);color:var(--txt-mute);margin-top:.2rem;font-weight:600}
.plan-price{display:flex;align-items:baseline;gap:.45rem;margin-top:1.45rem}
.plan-price b{font-family:'Baloo 2',sans-serif;font-size:clamp(2.7rem,5vw,3.6rem);font-weight:700;letter-spacing:-.02em;line-height:1;
  background:linear-gradient(164deg,#FFF2DE,#FFC98C);-webkit-background-clip:text;background-clip:text;color:transparent}
.plan-price span{font-size:var(--s--1);color:var(--txt-mute);font-weight:700}
.plan-bill{font-size:var(--s--1);color:var(--txt-dim);margin-top:.55rem;font-weight:600}
.plan .btn{width:100%;margin-top:1.6rem}
.plan ul{list-style:none;margin:1.7rem 0 0;padding:0;display:grid;gap:.75rem}
.plan li{display:flex;gap:.7rem;font-size:var(--s--1);color:var(--txt-dim);align-items:flex-start;line-height:1.5;font-weight:600}
.pay-note{margin-top:1.7rem;text-align:center;font-size:.82rem;color:var(--txt-mute);font-weight:700}
.badges{display:flex;gap:.8rem;justify-content:center;margin-top:1.9rem;flex-wrap:wrap}
.badge{display:flex;align-items:center;gap:.65em;padding:.78em 1.25em;border-radius:18px;font-size:.85rem;font-weight:800;
  background:linear-gradient(174deg,rgba(255,240,222,.11),rgba(255,240,222,.04));
  box-shadow:inset 0 1px 0 rgba(255,241,222,.22),inset 0 0 0 1px rgba(255,231,203,.09),0 3px 10px rgba(4,6,16,.24),0 14px 32px rgba(4,6,16,.22);
  transition:transform .45s var(--ease),background .4s}
.badge:hover{background:linear-gradient(174deg,rgba(255,240,222,.18),rgba(255,240,222,.07));transform:translateY(-3px)}
.badge small{display:block;font-size:.66rem;font-weight:700;color:var(--txt-mute)}
footer{background:#080A16;padding-block:clamp(48px,6vw,74px) 2rem;box-shadow:inset 0 1px 0 rgba(255,231,203,.06)}
.foot-grid{display:grid;grid-template-columns:1.6fr repeat(3,1fr);gap:clamp(26px,4vw,50px)}
@media(max-width:840px){.foot-grid{grid-template-columns:1fr 1fr}}
.foot-grid h4{font-family:'Nunito',sans-serif;font-size:.74rem;letter-spacing:.13em;text-transform:uppercase;color:var(--txt-mute);font-weight:800}
.foot-grid ul{list-style:none;margin:1.05rem 0 0;padding:0;display:grid;gap:.65rem}
.foot-grid li a{font-size:var(--s--1);color:var(--txt-dim);font-weight:600;transition:color .25s}
.foot-grid li a:hover{color:var(--txt)}
.foot-blurb{font-size:var(--s--1);color:var(--txt-mute);margin-top:1.15rem;max-width:34ch;line-height:1.62}
.foot-btm{margin-top:clamp(38px,5vw,60px);padding-top:1.6rem;box-shadow:inset 0 1px 0 rgba(255,231,203,.06);
  display:flex;flex-wrap:wrap;gap:.6rem 1.6rem;font-size:.8rem;color:var(--txt-mute);font-weight:600}

@media(prefers-reduced-motion:reduce){
  *{animation:none!important}
  #dust,.cue svg{display:none}
}
`;

export default function Home() {
  // Displayed prices must match what Stripe charges, so they come from the
  // visitor's country via /api/geo - same contract the previous homepage used.
  const [pricing, setPricing] = useState<PriceDisplay>(DISPLAY.aud);
  const [childName, setChildName] = useState('');

  useEffect(() => {
    let live = true;
    fetch('/api/geo')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (live && d && d.display) setPricing(d.display as PriceDisplay); })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  // The scroll journey: one sticky stage, a depth-mapped WebGL plate per beat.
  // Listeners are bound to an AbortSignal and the rAF loops check `stop` so
  // navigating away tears everything down.
  useEffect(() => {
    const ac = new AbortController();
    const sig = ac.signal;
    const stop = { v: false };
    try {
      (function(){
      "use strict";
      var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      var P_now = 0;
      var clamp=function(v,a,b){return v<a?a:v>b?b:v;};
      var lerp=function(a,b,t){return a+(b-a)*t;};
      var ease=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;};
      /* ramp: 0 before a, 1 after b, eased between */
      function ramp(p,a,b){ if(b===a) return p<a?0:1; return ease(clamp((p-a)/(b-a),0,1)); }
      /* window: fades in over [a,a+fi], holds, fades out over [b-fo,b] */
      function win(p,a,b,fi,fo){ return Math.min(ramp(p,a,a+fi), 1-ramp(p,b-fo,b)); }

      /* ================= BEATS ================= */
      var BEATS=[
        {a:0.00,b:0.15,fi:0},   /* visible at rest - nothing here waits on a scroll */
        {a:0.15,b:0.32},
        {a:0.32,b:0.48},
        {a:0.48,b:0.66},
        {a:0.66,b:0.83},
        {a:0.83,b:1.00}
      ];
      var beatEls=[].slice.call(document.querySelectorAll('.beat'));
      var railEls=[].slice.call(document.querySelectorAll('#rail i'));
      var journey=document.getElementById('journey');
      var cv=document.getElementById('depth-canvas');
      var bgHero=document.getElementById('bgHero'), bgSky=document.getElementById('bgSky'),
          bgGate=document.getElementById('bgGate'), bgBand=document.getElementById('bgBand');
      var portalsWrap=document.getElementById('portals'), portals=[].slice.call(document.querySelectorAll('.portal'));
      var cue=document.getElementById('cue'), nav=document.getElementById('nav');

      /* ================= the camera loop ================= */
      var P=0, targetP=0, activeBeat=-1;
      function measure(){ return Math.max(1, journey.offsetHeight - innerHeight); }
      var span=measure();
      addEventListener('resize',function(){ span=measure(); },{passive:true,signal:sig});

      function paint(p){
        /* --- backgrounds --- */
        var skyIn=win(p,0.145,0.40,0.055,0.06);
        var gateIn=win(p,0.345,0.70,0.055,0.07);
        var bandIn=ramp(p,0.79,0.88);
        bgSky.style.opacity=skyIn;
        bgGate.style.opacity=gateIn;
        bgBand.style.opacity=bandIn;
        bgHero.style.opacity=1-ramp(p,0.145,0.20);

        /* flying up through the sky */
        var sf=ramp(p,0.11,0.42);
        bgSky.style.transform='scale('+lerp(1.34,1.02,sf)+') translate3d(0,'+lerp(14,-12,sf)+'%,0)';
        var gf=ramp(p,0.30,0.70);
        bgGate.style.transform='scale('+lerp(1.02,1.30,gf)+') translate3d(0,'+lerp(6,-6,gf)+'%,0)';
        bgBand.style.transform='scale('+lerp(1.16,1.04,ramp(p,0.79,1))+')';
        bgHero.style.transform='scale('+lerp(1.02,1.20,ramp(p,0,0.24))+')';

        /* --- portals flying past the camera --- */
        var pw=win(p,0.44,0.68,0.06,0.05);
        portalsWrap.style.opacity=pw;
        if(pw>0.001){
          var t=clamp((p-0.44)/0.24,0,1);
          for(var i=0;i<portals.length;i++){
            var local=t*(portals.length+2.6) - i;      /* staggered arrival */
            var k=clamp(local/2.6,0,1);
            var z=lerp(-1500,620,k);
            var side=(i%2?1:-1);
            var xoff=side*lerp(13,32,k);
            var yoff=(i%3-1)*9;
            var fade=clamp(local/0.6,0,1)*(1-clamp((local-2.05)/0.55,0,1));
            var el=portals[i];
            el.style.transform='translate3d(calc(-50% + '+xoff+'vw), calc(-50% + '+yoff+'vh), '+z+'px) rotateY('+(-side*13)+'deg)';
            el.style.opacity=fade;
          }
        }

        /* --- beat copy --- */
        var newBeat=0;
        for(var b=0;b<BEATS.length;b++){
          var B=BEATS[b];
          var fi=(B.fi!==undefined)?B.fi:(B.b-B.a)*0.30;
          var o=win(p,B.a,B.b,fi,(B.b-B.a)*0.26);
          var el=beatEls[b];
          el.style.opacity=o;
          var t2=clamp((p-B.a)/(B.b-B.a),0,1);
          el.style.transform='translate3d(0,'+lerp(34,-34,t2)+'px,0)';
          el.classList.toggle('live', o>0.55);
          if(p>=B.a && p<B.b) newBeat=b;
        }

        if(newBeat!==activeBeat){
          activeBeat=newBeat;
          railEls.forEach(function(r,i){ r.classList.toggle('on', i===newBeat); });
        }

        cue.style.opacity = p<0.03 ? 1 : 0;
        nav.classList.toggle('stuck', scrollY>40);
      }

      var lastT=0;
      function tick(now){
        targetP = clamp(scrollY/span, 0, 1);
        /* frame-rate independent easing, so a slow device still lands where it should */
        var dt = lastT ? Math.min((now-lastT)/1000, 0.1) : 0.016; lastT=now;
        var k = reduce ? 1 : 1-Math.pow(0.0001, dt);
        P += (targetP-P) * k;
        if(Math.abs(targetP-P)<0.0002) P=targetP;
        P_now=P;
        paint(P);
        if(!stop.v) requestAnimationFrame(tick);
      }
      paint(0);
      if(!stop.v) requestAnimationFrame(tick);

      /* ============ depth renderer: EVERY plate is 3D and tracks the cursor ============ */
      var VS='attribute vec2 p;varying vec2 uv;void main(){uv=p*0.5+0.5;uv.y=1.0-uv.y;gl_Position=vec4(p,0.,1.);}';
      var FS=[
      'precision highp float;varying vec2 uv;',
      'uniform sampler2D cA,dA,cB,dB;',
      'uniform vec2 offA,offB,texA,texB,ctrA,ctrB;',
      'uniform float zA,zB,iA,iB,aspC,mixAB,fade,dimA,dimB,shpA,shpB;',
      'float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
      /* where on the plate this screen pixel lands, after cover-fit and depth displacement */
      'vec2 warp(sampler2D dep,vec2 off,float zoom,float aspI,vec2 ctr){',
      '  vec2 c=uv-0.5;',
      '  if(aspC>aspI){c.y*=aspI/aspC;}else{c.x*=aspC/aspI;}',
      '  c/=zoom; vec2 q=c+0.5+ctr; vec2 acc=vec2(0.0);',
      '  for(int i=0;i<8;i++){',
      '    float d=texture2D(dep,clamp(q+acc,0.001,0.999)).r;',
      '    acc+=off*(d-0.45)/8.0;',
      '  }',
      '  return clamp(q+acc,0.0,1.0);',
      '}',
      /* 5-tap unsharp mask. The LoRA renders softly at 4 steps, so the art needs
         its edges put back rather than more pixels. */
      'vec3 fetch(sampler2D col,vec2 f,vec2 tx,float sh){',
      '  vec3 c=texture2D(col,f).rgb;',
      '  vec3 b=(texture2D(col,f+vec2(tx.x,0.0)).rgb+texture2D(col,f-vec2(tx.x,0.0)).rgb',
      '        + texture2D(col,f+vec2(0.0,tx.y)).rgb+texture2D(col,f-vec2(0.0,tx.y)).rgb)*0.25;',
      '  return c+(c-b)*sh;',
      '}',
      'void main(){',
      '  vec3 a=fetch(cA,warp(dA,offA,zA,iA,ctrA),texA,shpA)*dimA;',
      '  vec3 b=fetch(cB,warp(dB,offB,zB,iB,ctrB),texB,shpB)*dimB;',
      '  vec3 col=mix(a,b,mixAB)*fade;',
      '  float l=max(max(col.r,col.g),col.b);',
      '  col+=vec3(1.0,0.72,0.34)*pow(max(l-0.70,0.0),1.8)*0.34;',
      '  float v=1.0-0.5*dot(uv-0.5,uv-0.5)*2.2;',
      '  col*=v;',
      '  col+=(hash(gl_FragCoord.xy)-0.5)*(1.6/255.0);',
      '  gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);',
      '}'].join('\n');
      function sh(gl,t,src){var o=gl.createShader(t);gl.shaderSource(o,src);gl.compileShader(o);
        if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)){console.warn(gl.getShaderInfoLog(o));return null;}return o;}

      /* each plate owns a slice of the journey, plus how far the camera pushes into it */
      var PLATES=[
        {col:'/journey/hero.avif',  dep:'/journey/hero-depth.avif', from:0.00, to:0.20, fi:0.00, fo:0.055, z0:1.02, z1:1.18, par:1.10, cx:0.0, cy:0.02, shpk:1.15},
        {col:'/journey/sky.avif',   dep:'/journey/sky-depth.avif',  from:0.145,to:0.40, fi:0.055,fo:0.06, z0:1.22, z1:1.02, par:0.85, dim:0.60},
        {col:'/journey/gate.avif',  dep:'/journey/gate-depth.avif', from:0.345,to:0.70, fi:0.055,fo:0.07, z0:1.02, z1:1.26, par:1.55, dim:0.86},
        {col:'/journey/band.avif',  dep:'/journey/band-depth.avif', from:0.78, to:1.01, fi:0.08, fo:0.02, z0:1.02, z1:1.12, par:0.80, dim:1.00, cx:0.0, cy:0.0, shpk:1.15}
      ];

      (function(){
        if(reduce) return;
        var opts={antialias:false,alpha:false,powerPreference:'high-performance'};
        /* WebGL2 allows mipmaps on non-power-of-two textures. Without mipmaps a 4282px
           plate minified to a 1440px canvas aliases badly - that reads as "pixelated". */
        var gl=cv.getContext('webgl2',opts), gl2=!!gl;
        if(!gl){ gl=cv.getContext('webgl',opts); }
        if(!gl) return;
        var vs=sh(gl,gl.VERTEX_SHADER,VS), fs=sh(gl,gl.FRAGMENT_SHADER,FS); if(!vs||!fs) return;
        var pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);
        if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){ console.warn(gl.getProgramInfoLog(pr)); return; }
        gl.useProgram(pr);

        var bf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bf);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
        var lo=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(lo);gl.vertexAttribPointer(lo,2,gl.FLOAT,false,0,0);

        var U={};
        ['offA','offB','texA','texB','zA','zB','iA','iB','aspC','mixAB','fade','dimA','dimB','shpA','shpB','ctrA','ctrB'].forEach(function(n){ U[n]=gl.getUniformLocation(pr,n); });
        /* fixed sampler units: colour A=0, depth A=1, colour B=2, depth B=3 */
        gl.uniform1i(gl.getUniformLocation(pr,'cA'),0);
        gl.uniform1i(gl.getUniformLocation(pr,'dA'),1);
        gl.uniform1i(gl.getUniformLocation(pr,'cB'),2);
        gl.uniform1i(gl.getUniformLocation(pr,'dB'),3);

        function upload(img){
          var t=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,t);
          gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
          gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);
          /* LINEAR, no mipmaps: the plate is sized close to the render buffer so
             there is nothing to minify, and a mip chain would only soften it. */
          gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
          return t;
        }

        var BASE_SHP=0.55;
        var maxTex=gl.getParameter(gl.MAX_TEXTURE_SIZE);
        /* four plates at full size is ~220MB of VRAM - fine on desktop, not on a phone */
        /* Size the plate to roughly the render buffer. Bigger is NOT better here:
           oversized textures either alias (no mips) or blur (with mips). */
        var texCap=Math.min(maxTex, Math.round(Math.min(3400, Math.max(1500, cv.clientWidth*2.1))));
        var pending=PLATES.length*2, ready=false;
        PLATES.forEach(function(P){
          P.ct=null; P.dt=null; P.aspect=1.777;
          var ci=new Image();
          ci.onload=function(){
            P.aspect=ci.width/ci.height;
            /* stay inside this GPU's texture limit rather than failing silently */
            if(ci.width>texCap){
              var cnv=document.createElement('canvas');
              cnv.width=texCap; cnv.height=Math.round(ci.height*texCap/ci.width);
              var c2=cnv.getContext('2d');
              c2.imageSmoothingEnabled=true; c2.imageSmoothingQuality='high';
              c2.drawImage(ci,0,0,cnv.width,cnv.height);
              P.tw=cnv.width; P.th=cnv.height; P.ct=upload(cnv);
            } else { P.tw=ci.width; P.th=ci.height; P.ct=upload(ci); }
            if(--pending===0) go();
          };
          ci.onerror=function(){ if(--pending===0) go(); };
          ci.src=P.col;
          var di=new Image();
          di.onload=function(){ P.dt=upload(di); if(--pending===0) go(); };
          di.onerror=function(){ if(--pending===0) go(); };
          di.src=P.dep;
        });

        var mx=0,my=0,tx=0,ty=0;
        addEventListener('pointermove',function(e){
          tx=(e.clientX/innerWidth-.5)*2; ty=(e.clientY/innerHeight-.5)*2;
        },{passive:true,signal:sig});
        addEventListener('deviceorientation',function(e){
          if(e.gamma!=null){ tx=clamp(e.gamma/26,-1,1); ty=clamp((e.beta-42)/26,-1,1); }
        },{capture:true,signal:sig});

        function size(){
          /* On a 1x display a 1:1 backing store gives the shader nothing to average,
             so render ~1.8x and let the browser downsample. That is the supersampling. */
          var dpr=devicePixelRatio||1;
          var ss = dpr<1.5 ? 1.85 : Math.min(dpr,2);
          /* keep the buffer inside sane limits on very large windows */
          var cap=Math.sqrt((3200*1800)/(cv.clientWidth*cv.clientHeight||1));
          ss=Math.min(ss, Math.max(1, cap));
          cv.width=Math.round(cv.clientWidth*ss); cv.height=Math.round(cv.clientHeight*ss);
          gl.viewport(0,0,cv.width,cv.height);
          gl.uniform1f(U.aspC, cv.width/cv.height);
          /* less sharpening when the buffer is already dense, more when it is not */
          BASE_SHP = (devicePixelRatio||1)<1.5 ? 0.62 : 0.44;
        }

        function bind(P,base){
          gl.activeTexture(gl.TEXTURE0+base);   gl.bindTexture(gl.TEXTURE_2D,P.ct);
          gl.activeTexture(gl.TEXTURE0+base+1); gl.bindTexture(gl.TEXTURE_2D,P.dt);
        }

        function go(){
          /* a plate that failed to load is dropped rather than rendered as black */
          PLATES=PLATES.filter(function(P){ return P.ct && P.dt && P.tw; });
          if(!PLATES.length) return;
          ready=true;
          size(); addEventListener('resize',size,{signal:sig});
          cv.classList.add('live');
          /* the CSS fallback layer is no longer needed once the canvas is live */
          [bgHero,bgSky,bgGate,bgBand].forEach(function(el){ el.style.visibility='hidden'; });

          (function frame(){
            if(ready){
              mx+=(tx-mx)*.06; my+=(ty-my)*.06;

              /* weight every plate, then render the two strongest */
              var best=null, second=null;
              for(var i=0;i<PLATES.length;i++){
                var P=PLATES[i];
                P.w=Math.min(ramp(P_now,P.from,P.from+P.fi), 1-ramp(P_now,P.to-P.fo,P.to));
                if(!best||P.w>best.w){ second=best; best=P; }
                else if(!second||P.w>second.w){ second=P; }
              }
              if(best){
                var A=best, B=second||best;
                var total=A.w+(B===A?0:B.w);
                var mixAB = (B===A||total<=0) ? 0 : B.w/total;
                bind(A,0); bind(B,2);
                gl.uniform1f(U.iA,A.aspect); gl.uniform1f(U.iB,B.aspect);
                var ta=clamp((P_now-A.from)/(A.to-A.from),0,1);
                var tb=clamp((P_now-B.from)/(B.to-B.from),0,1);
                gl.uniform1f(U.zA, lerp(A.z0,A.z1,ease(ta)));
                gl.uniform1f(U.zB, lerp(B.z0,B.z1,ease(tb)));
                /* cursor parallax on BOTH plates, plus a scroll push straight into the scene */
                gl.uniform2f(U.offA, mx*0.078*A.par, my*0.054*A.par + ta*0.058*A.par);
                gl.uniform2f(U.offB, mx*0.078*B.par, my*0.054*B.par + tb*0.058*B.par);
                gl.uniform1f(U.mixAB, mixAB);
                gl.uniform1f(U.dimA, A.dim||1); gl.uniform1f(U.dimB, B.dim||1);
                /* unsharp radius of ~1.35 texels reads well without haloing */
                gl.uniform2f(U.texA, 1.35/A.tw, 1.35/A.th);
                gl.uniform2f(U.texB, 1.35/B.tw, 1.35/B.th);
                gl.uniform2f(U.ctrA, (A.cx||0), (A.cy||0));
                gl.uniform2f(U.ctrB, (B.cx||0), (B.cy||0));
                gl.uniform1f(U.shpA, BASE_SHP*(A.shpk||1));
                gl.uniform1f(U.shpB, BASE_SHP*(B.shpk||1));
                /* dip to black through the book-page beat, where no plate is on */
                gl.uniform1f(U.fade, clamp(Math.max(A.w,(B===A?0:B.w))*1.25,0,1));
                gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
              }
            }
            if(!stop.v) requestAnimationFrame(frame);
          })();
        }
      })();

      /* ================= stardust ================= */
      (function(){
        var c=document.getElementById('dust'); if(reduce) return;
        var x=c.getContext('2d'), Pt=[], W=0,H=0, dpr=Math.min(devicePixelRatio||1,2);
        function rs(){ W=c.clientWidth;H=c.clientHeight;c.width=W*dpr;c.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0);
          Pt=[]; var n=Math.round(Math.min(130, W*H/10000));
          for(var i=0;i<n;i++) Pt.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.5+.35,
            s:Math.random()*.24+.05,d:Math.random()*6.28,o:Math.random()*.6+.2,h:Math.random()<.22});
        }
        rs(); addEventListener('resize',rs,{signal:sig});
        var t=0;
        (function f(){
          t+=.01; x.clearRect(0,0,W,H);
          /* dust thickens in the sky and world beats */
          var amt = 0.35 + 0.65*Math.min(ramp(P,0.10,0.34), 1-ramp(P,0.66,0.80));
          for(var i=0;i<Pt.length;i++){ var q=Pt[i];
            q.y-=q.s*(1+P*1.6); q.x+=Math.sin(t+q.d)*.16;
            if(q.y<-6){q.y=H+6;q.x=Math.random()*W;}
            var tw=q.o*(.55+.45*Math.sin(t*2.2+q.d))*amt;
            if(tw<=0.002) continue;
            x.beginPath(); x.arc(q.x,q.y,q.r,0,6.284);
            x.fillStyle=q.h?'rgba(255,225,180,'+tw+')':'rgba(255,190,110,'+(tw*.75)+')';
            x.shadowBlur=q.r*5; x.shadowColor='rgba(255,180,90,'+(tw*.55)+')';
            x.fill();
          }
          x.shadowBlur=0;
          if(!stop.v) requestAnimationFrame(f);
        })();
      })();
      })();
    } catch (err) {
      // A shader or context failure must not take the page down - the CSS
      // fallback layer under the canvas still shows every plate.
      console.warn('[journey] renderer unavailable', err);
    }
    return () => { stop.v = true; ac.abort(); };
  }, []);

  const trimmed = childName.trim();
  const displayName = trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : 'your child';
  const signupHref = trimmed ? '/signup?name=' + encodeURIComponent(trimmed) : '/signup';

  return (
    <>
      <style>{S}</style>
      <header className="nav" id="nav">
        <div className="wrap nav-in">
          <Link className="logo" href="/" aria-label="TalePop home">
            <img src="/brand/talepop-wordmark.webp" alt="TalePop" />
          </Link>
          <nav className="nav-links">
            <a href="#pricing">Pricing</a>
            <a href="#safety">Safety</a>
          </nav>
          <Link className="btn btn-primary" href="/signup" style={{ padding: '.68em 1.2em', fontSize: 'var(--s--1)' }}>Start free</Link>
        </div>
      </header>

      <div className="rail" id="rail" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>

      {/* ============================ THE JOURNEY ============================ */}
      <div className="journey" id="journey">
        <div className="stage" id="stage">

          <img className="bgimg" id="bgHero" src="/journey/hero.avif" alt="" aria-hidden="true" style={{ opacity: 1, objectPosition: '50% 52%' }} />
          <img className="bgimg" id="bgSky" src="/journey/sky.avif" alt="" aria-hidden="true" />
          <img className="bgimg" id="bgGate" src="/journey/gate.avif" alt="" aria-hidden="true" />
          <img className="bgimg" id="bgBand" src="/journey/band.avif" alt="" aria-hidden="true" style={{ objectPosition: '50% 50%' }} />
          <canvas id="depth-canvas" aria-hidden="true"></canvas>

          <div className="portals" id="portals" aria-hidden="true">
            <div className="portal"><img src="/journey/world-space.avif" alt="" /><span>Beyond the last planet</span></div>
            <div className="portal"><img src="/journey/world-unicorn.avif" alt="" /><span>The kingdom in the clouds</span></div>
            <div className="portal"><img src="/journey/world-dino.avif" alt="" /><span>The gentle giant</span></div>
            <div className="portal"><img src="/journey/world-pirate.avif" alt="" /><span>Captain for one night</span></div>
            <div className="portal"><img src="/journey/world-ocean.avif" alt="" /><span>The whale who waited</span></div>
            <div className="portal"><img src="/journey/world-hero.avif" alt="" /><span>The cape stays on</span></div>
          </div>

          <div className="scrim"></div>
          <canvas id="dust" aria-hidden="true"></canvas>

          <div className="beats" id="beats">

            {/* 0 -------------------------------------------------- */}
            <section className="beat" data-beat="0">
              <div className="wrap">
                <p className="kick">A new story every night</p>
                <h1>Tonight's story has <em>their name</em> in it.</h1>
                <p className="lead">Not a name dropped into a stock story. A brand new one, written and illustrated for one child, ready before lights out.</p>
                <div className="acts">
                  <Link className="btn btn-primary btn-lg" href={signupHref}>Create their first story</Link>
                </div>
                <div className="mini">
                  <span><svg className="tick" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 10.6l4 4 8-9"/></svg> First book free</span>
                  <span><svg className="tick" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 10.6l4 4 8-9"/></svg> No credit card</span>
                  <span><svg className="tick" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 10.6l4 4 8-9"/></svg> Ages 3 to 10</span>
                </div>
              </div>
            </section>

            {/* 1 -------------------------------------------------- */}
            <section className="beat" data-beat="1">
              <div className="wrap">
                <p className="kick">Step one</p>
                <h2>So. Who is it for?</h2>
                <p className="lead">Type a name. Watch what happens to the story.</p>
                <div className="namecard">
                  <label htmlFor="kidname">Their first name</label>
                  <input id="kidname" type="text" placeholder="Their first name" autoComplete="off" spellCheck={false} maxLength={18}
                    value={childName} onChange={(e) => setChildName(e.target.value)} />
                  <div className="out" id="nameout">Once upon a time, <b>{displayName}</b> found a door at the back of the wardrobe that had never been there before. On the other side, something was already waiting.</div>
                </div>
              </div>
            </section>

            {/* 2 -------------------------------------------------- */}
            <section className="beat mid" data-beat="2">
              <div className="wrap">
                <p className="kick">Step two</p>
                <h2>Every night, a <em>different door</em>.</h2>
                <p className="lead">Their interests pick the world. Dinosaurs this month, deep sea the next. The plot changes with them.</p>
              </div>
            </section>

            {/* 3 -------------------------------------------------- */}
            <section className="beat mid top" data-beat="3">
              <div className="wrap">
                <p className="kick">Real pages</p>
                <h2>Every picture here came out of <em>our own art model</em>.</h2>
                <p className="lead">Not a stock library. We trained it ourselves so their character looks the same on page one and page twelve.</p>
              </div>
            </section>

            {/* 4 -------------------------------------------------- */}
            <section className="beat" data-beat="4">
              <div className="wrap spreadwrap">
                <div className="spread">
                  <div className="spread-txt">
                    <p className="dropcap">Zak and his sister Zoe had been walking through the mist for what felt like hours when the castle appeared, impossibly tall, purple turreted, glowing at every window as if someone inside had been expecting them.</p>
                    <p>A dragon landed on the drawbridge. It was green, about the size of a large horse, and it was wearing a very small hat.</p>
                    <p className="pgnum">PAGE 1 OF 12 &middot; WRITTEN FOR ZAK, AGE 7</p>
                  </div>
                  <div className="spread-img"><img src="/journey/spread.avif" alt="A child and a small green dragon in front of a glowing castle" /></div>
                </div>
              </div>
            </section>

            {/* 5 -------------------------------------------------- */}
            <section className="beat mid top" data-beat="5">
              <div className="wrap">
                <div className="qwrap">
                  <div className="stars" aria-label="Five stars">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6.3 6.9.9-5 4.8 1.3 6.9L12 17.6 5.8 20.9 7.1 14 2 9.2l6.9-.9L12 2z"/></svg>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6.3 6.9.9-5 4.8 1.3 6.9L12 17.6 5.8 20.9 7.1 14 2 9.2l6.9-.9L12 2z"/></svg>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6.3 6.9.9-5 4.8 1.3 6.9L12 17.6 5.8 20.9 7.1 14 2 9.2l6.9-.9L12 2z"/></svg>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6.3 6.9.9-5 4.8 1.3 6.9L12 17.6 5.8 20.9 7.1 14 2 9.2l6.9-.9L12 2z"/></svg>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6.3 6.9.9-5 4.8 1.3 6.9L12 17.6 5.8 20.9 7.1 14 2 9.2l6.9-.9L12 2z"/></svg>
                  </div>
                  <blockquote>"He stared at his own name on the page and said <b>'Mum, that's actually me.'</b> We've read it fourteen nights in a row."</blockquote>
                  <p className="byline">Sarah M.<i>Mum of Noah, age 6 &middot; Melbourne</i></p>
                </div>
              </div>
            </section>

          </div>

          <div className="cue" id="cue">
            <span>Scroll to begin</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v13m0 0l-6-6m6 6l6-6"/></svg>
          </div>
        </div>
      </div>

      {/* ============================ RELEASED ============================ */}
      <section className="sec" id="pricing">
        <div className="wrap">
          <div className="sec-head">
            <p className="kick">Pricing</p>
            <h2>A story a night, for less than a coffee a month.</h2>
            <p>Start with one free book. Cancel in a single tap, from inside the app.</p>
          </div>
          <div className="price-grid">
            <div className="plan">
              <h3>Monthly</h3>
              <p className="plan-sub">Flexible, cancel anytime</p>
              <div className="plan-price"><b>{pricing.monthlyPerStory}</b><span>per story</span></div>
              <p className="plan-bill">{pricing.symbol}{pricing.monthly} per month</p>
              <Link className="btn btn-ghost" href="/signup?plan=monthly">Start with a free book</Link>
              <ul>
                <li><svg className="tick" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 10.6l4 4 8-9"/></svg> A new story every day</li>
                <li><svg className="tick" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 10.6l4 4 8-9"/></svg> One child profile included</li>
                <li><svg className="tick" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 10.6l4 4 8-9"/></svg> Story series up to three volumes</li>
                <li><svg className="tick" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 10.6l4 4 8-9"/></svg> Extra books half price at 50&cent;</li>
                <li><svg className="tick" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 10.6l4 4 8-9"/></svg> Additional children {pricing.symbol}{pricing.extraChild} each</li>
              </ul>
            </div>
            <div className="plan best">
              <span className="plan-tag">Best value &middot; 2 months free</span>
              <h3>Annual</h3>
              <p className="plan-sub">Two months on us</p>
              <div className="plan-price"><b>{pricing.annualPerStory}</b><span>per story</span></div>
              <p className="plan-bill">{pricing.symbol}{pricing.annual} billed yearly &middot; saves {pricing.symbol}{pricing.annualSaving}</p>
              <Link className="btn btn-primary" href="/signup?plan=annual">Get the best deal</Link>
              <ul>
                <li><svg className="tick" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 10.6l4 4 8-9"/></svg> Everything in Monthly</li>
                <li><svg className="tick" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 10.6l4 4 8-9"/></svg> Priority story generation</li>
                <li><svg className="tick" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 10.6l4 4 8-9"/></svg> Early access to new features</li>
                <li><svg className="tick" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 10.6l4 4 8-9"/></svg> Same 50&cent; extra books</li>
                <li><svg className="tick" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 10.6l4 4 8-9"/></svg> Additional children {pricing.symbol}{pricing.extraChild} each</li>
              </ul>
            </div>
          </div>
          <p className="pay-note">Secure payment via Stripe on the web, or Apple in-app purchase. Card details are never stored by TalePop.</p>
        </div>
      </section>

      <section className="sec" id="safety" style={{ paddingTop: 'clamp(20px,3vw,44px)' }}>
        <div className="wrap">
          <img className="brandmark" src="/brand/talepop-lockup.webp" alt="TalePop — Your story maker — Imagine away. A new tale every day." />
          <div className="sec-head">
            <p className="kick">For the grown-ups</p>
            <h2>Their first book is free. It can be ready before bedtime.</h2>
            <p>No ads, no third party tracking, no data sold. Reading level matched to their age, and nothing in a TalePop book you would not read aloud yourself. Delete the profile and it is gone.</p>
          </div>
          <div className="acts" style={{ justifyContent: 'center', marginTop: '2rem' }}>
            <Link className="btn btn-primary btn-lg" href={signupHref}>Create their first story</Link>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <Link className="lockup" href="/" aria-label="TalePop. Your story maker. Imagine away. A new tale every day.">
                <img src="/brand/talepop-lockup.webp" alt="TalePop — Your story maker — Imagine away. A new tale every day." />
              </Link>
              <p className="foot-blurb">Personalised bedtime stories, written and illustrated for one child. Made in Australia by TalePop Pty Ltd.</p>
            </div>
            <div><h4>Product</h4><ul><li><a href="#pricing">Pricing</a></li><li><a href="#safety">Safety</a></li><li><Link href="/signup">Start free</Link></li><li><Link href="/login">Sign in</Link></li></ul></div>
            <div><h4>Company</h4><ul><li><a href="mailto:info@talepopstories.com">info@talepopstories.com</a></li></ul></div>
            <div><h4>Legal</h4><ul><li><Link href="/privacy">Privacy policy</Link></li><li><Link href="/terms">Terms of service</Link></li></ul></div>
          </div>
          <div className="foot-btm">
            <span>&copy; 2026 TalePop Pty Ltd</span><span>info@talepopstories.com</span><span>Prices shown in AUD</span><span>Also available in USD and CAD</span>
          </div>
        </div>
      </footer>
    </>
  );
}
