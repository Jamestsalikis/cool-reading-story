import Link from 'next/link';

/**
 * Shared chrome for the marketing sub-pages (about, interests, sample stories).
 *
 * The homepage carries its own copy of this CSS inline because it also needs the
 * WebGL journey styles. Duplicating the tokens here is deliberate: it keeps the
 * homepage untouched, and these pages are small enough that the extra ~4KB of
 * gzipped CSS is cheaper than the risk of refactoring a page that is already
 * signed off.
 */
export const SUB_CSS = `
:root{
  --ink:#0B0D1C; --ink-2:#161A2E; --ink-3:#212642;
  --txt:#F6EFE4; --txt-dim:#B7B2C4; --txt-mute:#7C7893;
  --amber:#FFB765; --amber-hi:#FFDCA8; --amber-lo:#E8913A;
  --orange:#FF7A45; --teal:#45BFCB;
  --r-sm:16px; --r:22px; --r-lg:32px;
  --sh-3:0 2px 6px rgba(4,6,16,.22),0 12px 30px rgba(4,6,16,.22),0 32px 70px rgba(4,6,16,.28);
  --s--1:clamp(.86rem,.83rem + .14vw,.95rem);
  --s-0:clamp(1.02rem,.99rem + .17vw,1.11rem);
  --s-1:clamp(1.18rem,1.1rem + .38vw,1.4rem);
  --s-2:clamp(1.5rem,1.3rem + .9vw,2.1rem);
  --s-3:clamp(1.95rem,1.55rem + 2vw,3.2rem);
  --pad:clamp(20px,5vw,64px); --maxw:1100px;
}
*{box-sizing:border-box}
body{margin:0;background:var(--ink);color:var(--txt);
  font-family:'Nunito',system-ui,-apple-system,sans-serif;
  font-size:var(--s-0);line-height:1.7;font-weight:500;
  -webkit-font-smoothing:antialiased;overflow-x:hidden}
h1,h2,h3,h4{font-family:'Baloo 2','Nunito',system-ui,sans-serif;font-weight:700;
  letter-spacing:-.015em;line-height:1.14;margin:0;color:var(--txt)}
a{color:inherit}
img{max-width:100%;display:block}
.wrap{max-width:var(--maxw);margin-inline:auto;padding-inline:var(--pad)}

/* nav */
.nav{position:sticky;top:0;z-index:50;background:rgba(11,13,28,.86);
  backdrop-filter:blur(18px) saturate(150%);border-bottom:1px solid rgba(255,231,203,.08)}
.nav-in{display:flex;align-items:center;gap:clamp(14px,2.4vw,30px);padding-block:14px}
.nav .logo img{height:34px;width:auto}
.nav-links{display:flex;gap:clamp(12px,1.8vw,24px);margin-left:auto;font-size:var(--s--1);
  font-weight:700;align-items:center}
.nav-links a{text-decoration:none;color:var(--txt-dim)}
.nav-links a:hover{color:var(--txt)}
/* .nav-links a is more specific than .btn-primary, which was overriding the
   button's dark label colour and leaving it at ~1.2:1 against the amber. */
.nav-links a.btn-primary,.nav-links a.btn-primary:hover{color:#3A1B06}
@media(max-width:640px){.nav-links a.hide-sm{display:none}}

/* buttons */
.btn{display:inline-block;border:0;cursor:pointer;text-decoration:none;font-weight:800;
  font-family:'Baloo 2','Nunito',sans-serif;border-radius:999px;padding:.8em 1.5em;
  font-size:var(--s-0);transition:transform .2s,box-shadow .2s}
.btn-primary{color:#3A1B06;background:linear-gradient(180deg,var(--amber-hi),var(--amber-lo));
  box-shadow:0 2px 6px rgba(232,145,58,.34),0 12px 30px rgba(232,145,58,.26)}
.btn-primary:hover{transform:translateY(-2px)}
.btn-ghost{color:var(--txt);background:rgba(255,231,203,.07);
  box-shadow:inset 0 0 0 1px rgba(255,231,203,.16)}

/* page head */
.phead{padding-block:clamp(46px,7vw,96px) clamp(24px,3vw,40px);text-align:center}
.kick{font-family:'Baloo 2',sans-serif;font-weight:700;letter-spacing:.16em;text-transform:uppercase;
  font-size:.76rem;color:var(--amber);margin:0 0 1rem}
.phead h1{font-size:var(--s-3);max-width:30ch;margin-inline:auto}
.phead .lede{margin:1.3rem auto 0;max-width:60ch;color:var(--txt-dim);font-size:var(--s-1);line-height:1.56}

/* prose */
.prose{max-width:68ch;margin-inline:auto;padding-block:clamp(10px,2vw,24px)}
.prose h2{font-size:var(--s-2);margin:2.6rem 0 .9rem}
.prose h3{font-size:var(--s-1);margin:2rem 0 .6rem}
.prose p{color:var(--txt-dim);margin:0 0 1.15rem}
.prose ul{color:var(--txt-dim);padding-left:1.2em;margin:0 0 1.2rem}
.prose li{margin-bottom:.5rem}
.prose strong{color:var(--txt);font-weight:800}
.prose a{color:var(--amber);text-decoration:underline;text-underline-offset:3px}

/* card grids */
.grid{display:grid;gap:clamp(14px,1.8vw,22px);margin-block:clamp(28px,4vw,48px)}
.grid-3{grid-template-columns:repeat(3,1fr)}
.grid-2{grid-template-columns:repeat(2,1fr)}
@media(max-width:860px){.grid-3{grid-template-columns:repeat(2,1fr)}}
@media(max-width:620px){.grid-3,.grid-2{grid-template-columns:1fr}}
.card{border-radius:var(--r);padding:clamp(18px,2vw,26px);text-decoration:none;display:block;
  background:linear-gradient(168deg,rgba(38,44,74,.74),rgba(15,18,36,.82));
  box-shadow:inset 0 1px 0 rgba(255,241,222,.18),inset 0 0 0 1px rgba(255,231,203,.09),var(--sh-3)}
.card h3{font-size:var(--s-1);margin-bottom:.45rem}
.card p{color:var(--txt-dim);font-size:var(--s--1);margin:0;line-height:1.7}
a.card:hover{transform:translateY(-3px);transition:transform .2s}
.card .emoji{font-size:1.7rem;line-height:1;margin-bottom:.7rem}
.card-img{border-radius:var(--r-sm);overflow:hidden;margin-bottom:1rem;aspect-ratio:4/5;background:var(--ink-2)}
.card-img img{width:100%;height:100%;object-fit:cover}

/* story pages */
.storyhead{text-align:center;padding-block:clamp(40px,6vw,80px) 0}
.storyhead .meta{color:var(--txt-mute);font-size:var(--s--1);font-weight:700;
  letter-spacing:.06em;text-transform:uppercase;margin-top:1.1rem}
.story-hero{max-width:520px;margin:clamp(26px,4vw,44px) auto 0;border-radius:var(--r-lg);
  overflow:hidden;box-shadow:var(--sh-3)}
.page{max-width:64ch;margin:clamp(30px,4vw,52px) auto 0;padding-bottom:clamp(24px,3vw,38px);
  border-bottom:1px solid rgba(255,231,203,.10)}
.page:last-of-type{border-bottom:0}
.page-n{font-family:'Baloo 2',sans-serif;font-weight:800;color:var(--amber);
  font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;margin:0 0 .8rem}
.page p{margin:0 0 1.1rem;color:var(--txt-dim);font-size:var(--s-1);line-height:1.72}
.moral{max-width:64ch;margin:clamp(30px,4vw,48px) auto 0;padding:clamp(20px,2.4vw,30px);
  border-radius:var(--r);border-left:3px solid var(--amber);
  background:linear-gradient(168deg,rgba(38,44,74,.6),rgba(15,18,36,.7))}
.moral p{margin:0;color:var(--txt);font-size:var(--s-1);line-height:1.6}
.moral span{display:block;color:var(--amber);font-size:.76rem;font-weight:800;
  letter-spacing:.16em;text-transform:uppercase;margin-bottom:.6rem;font-family:'Baloo 2',sans-serif}

/* cta band */
.cta{text-align:center;padding-block:clamp(44px,6vw,84px);margin-top:clamp(30px,4vw,56px);
  border-top:1px solid rgba(255,231,203,.08)}
.cta h2{font-size:var(--s-2);max-width:28ch;margin:0 auto 1rem}
.cta p{color:var(--txt-dim);max-width:52ch;margin:0 auto 1.8rem}
.cta .mini{color:var(--txt-mute);font-size:var(--s--1);margin-top:1rem}

/* footer */
footer{border-top:1px solid rgba(255,231,203,.08);padding-block:clamp(38px,5vw,64px);
  font-size:var(--s--1)}
.foot-grid{display:grid;grid-template-columns:1.6fr repeat(3,1fr);gap:clamp(24px,4vw,48px)}
.foot-grid>*{min-width:0}
@media(max-width:840px){.foot-grid{grid-template-columns:1fr 1fr}}
/* Two columns cannot fit the 220px logo beside a links column on a narrow
   phone: it pushed the Legal column off-screen. One column below 560px. */
@media(max-width:560px){.foot-grid{grid-template-columns:1fr}}
footer .lockup img{max-width:min(220px,60vw)}
footer li a{overflow-wrap:anywhere}
.foot-blurb{color:var(--txt-mute);margin-top:1rem;max-width:34ch;line-height:1.7}
footer h4{font-size:.76rem;letter-spacing:.16em;text-transform:uppercase;color:var(--txt-mute);
  margin-bottom:1rem;font-family:'Baloo 2',sans-serif}
footer ul{list-style:none;padding:0;margin:0}
footer li{margin-bottom:.62rem}
footer li a{color:var(--txt-dim);text-decoration:none}
footer li a:hover{color:var(--txt)}
.foot-btm{display:flex;flex-wrap:wrap;gap:1.2rem;color:var(--txt-mute);
  margin-top:clamp(26px,3.5vw,44px);padding-top:1.4rem;border-top:1px solid rgba(255,231,203,.07)}
`;

export function SiteHeader() {
  return (
    <header className="nav">
      <div className="wrap nav-in">
        <Link className="logo" href="/" aria-label="TalePop home">
          <img src="/brand/talepop-wordmark.webp" alt="TalePop" width={140} height={34} />
        </Link>
        <nav className="nav-links">
          <Link className="hide-sm" href="/sample-stories">Sample stories</Link>
          <Link className="hide-sm" href="/story-ideas">Story ideas</Link>
          <Link className="hide-sm" href="/about">About</Link>
          <Link href="/#pricing">Pricing</Link>
          <Link className="btn btn-primary" href="/signup" style={{ padding: '.6em 1.15em', fontSize: 'var(--s--1)' }}>
            Start free
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <Link className="lockup" href="/" aria-label="TalePop. Your story maker.">
              <img src="/brand/talepop-lockup.webp" alt="TalePop, your story maker" />
            </Link>
            <p className="foot-blurb">
              Personalised bedtime stories, written and illustrated for one child. Made in
              Australia by TalePop Pty Ltd.
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link href="/sample-stories">Sample stories</Link></li>
              <li><Link href="/story-ideas">Story ideas</Link></li>
              <li><Link href="/about">Our story</Link></li>
            </ul>
          </div>
          <div>
            <h4>Product</h4>
            <ul>
              <li><Link href="/#how-it-works">How it works</Link></li>
              <li><Link href="/#pricing">Pricing</Link></li>
              <li><Link href="/#faq">FAQ</Link></li>
              <li><Link href="/signup">Start free</Link></li>
              <li><Link href="/login">Sign in</Link></li>
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul>
              <li><a href="mailto:info@talepopstories.com">info@talepopstories.com</a></li>
              <li><Link href="/privacy">Privacy policy</Link></li>
              <li><Link href="/terms">Terms of service</Link></li>
            </ul>
          </div>
        </div>
        <div className="foot-btm">
          <span>&copy; 2026 TalePop Pty Ltd</span>
          <span>Prices shown in AUD</span>
          <span>Also available in USD and CAD</span>
        </div>
      </div>
    </footer>
  );
}

export function CtaBand({ heading, body }: { heading: string; body: string }) {
  return (
    <section className="cta">
      <div className="wrap">
        <h2>{heading}</h2>
        <p>{body}</p>
        <Link className="btn btn-primary" href="/signup">Create their first story</Link>
        <p className="mini">First book free. No credit card. Ages 3 to 10.</p>
      </div>
    </section>
  );
}
