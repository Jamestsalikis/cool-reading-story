import Link from 'next/link';

/**
 * Dark auth chrome for /login, /signup and /forgot-password, so the handoff from
 * the redesigned marketing pages does not drop the visitor onto a cream form.
 *
 * Every class here is namespaced `a-`. globals.css still owns `.card`, `.input`
 * and `.btn-brand`, which onboarding, the dashboard and the reader all rely on,
 * so nothing in this file can reach those pages.
 */
export const AUTH_CSS = `
:root{
  --ink:#0B0D1C; --ink-2:#161A2E;
  --txt:#F6EFE4; --txt-dim:#B7B2C4; --txt-mute:#7C7893;
  --amber:#FFB765; --amber-hi:#FFDCA8; --amber-lo:#E8913A;
  --teal:#45BFCB;
}
*{box-sizing:border-box}
body{margin:0;background:var(--ink);color:var(--txt);
  font-family:'Nunito',system-ui,-apple-system,sans-serif;
  -webkit-font-smoothing:antialiased;overflow-x:hidden}

.a-page{min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;
  align-items:center;justify-content:center;padding:clamp(20px,5vw,48px) 20px;
  position:relative;overflow:hidden}
/* the same warm glow the hero uses, so the page feels of a piece with the front end */
.a-page::before{content:'';position:absolute;inset:0;pointer-events:none;
  background:
   radial-gradient(120% 80% at 50% -10%, rgba(255,150,60,.16), transparent 60%),
   radial-gradient(90% 60% at 50% 110%, rgba(69,191,203,.08), transparent 60%)}

.a-logo{position:relative;display:inline-block;margin-bottom:clamp(22px,4vw,38px)}
.a-logo img{height:auto;width:clamp(150px,42vw,196px);display:block}

.a-card{position:relative;width:100%;max-width:436px;border-radius:32px;
  padding:clamp(26px,4vw,40px);
  background:linear-gradient(168deg,rgba(38,44,74,.80),rgba(15,18,36,.88));
  backdrop-filter:blur(30px) saturate(150%);
  box-shadow:inset 0 1px 0 rgba(255,241,222,.20),inset 0 0 0 1px rgba(255,231,203,.10),
   inset 0 -30px 60px rgba(6,8,20,.28),
   0 2px 6px rgba(4,6,16,.22),0 12px 30px rgba(4,6,16,.22),0 32px 70px rgba(4,6,16,.28)}

.a-h1{font-family:'Baloo 2','Nunito',sans-serif;font-weight:700;letter-spacing:-.015em;
  font-size:clamp(1.5rem,1.2rem + 1vw,1.85rem);line-height:1.16;margin:0 0 .55rem;
  text-align:center;color:var(--txt)}
.a-sub{text-align:center;color:var(--txt-dim);font-size:.95rem;line-height:1.55;
  margin:0 0 clamp(22px,3vw,30px)}

.a-label{display:block;font-size:.875rem;font-weight:700;color:var(--txt);margin-bottom:.5rem}
.a-field{margin-bottom:1.2rem}
.a-input{width:100%;padding:.85rem 1rem;border-radius:14px;font-size:1rem;
  font-family:inherit;color:var(--txt);
  background:rgba(8,10,22,.55);
  border:1px solid rgba(255,231,203,.16);
  outline:none;transition:border-color .18s,box-shadow .18s}
.a-input::placeholder{color:var(--txt-mute)}
.a-input:focus{border-color:var(--amber);box-shadow:0 0 0 3px rgba(255,183,101,.22)}
.a-input:-webkit-autofill{-webkit-text-fill-color:var(--txt);
  -webkit-box-shadow:0 0 0 1000px #14172a inset}

.a-btn{width:100%;display:inline-flex;align-items:center;justify-content:center;gap:.7rem;
  border:0;cursor:pointer;font-weight:800;font-family:'Baloo 2','Nunito',sans-serif;
  border-radius:999px;padding:.9em 1.4em;font-size:1rem;
  transition:transform .18s,box-shadow .18s,opacity .18s}
.a-btn:disabled{cursor:not-allowed;opacity:.5}
.a-primary{color:#3A1B06;background:linear-gradient(180deg,var(--amber-hi),var(--amber-lo));
  box-shadow:0 2px 6px rgba(232,145,58,.34),0 12px 30px rgba(232,145,58,.26)}
.a-primary:hover:not(:disabled){transform:translateY(-2px)}
.a-oauth{color:var(--txt);background:rgba(255,231,203,.07);
  box-shadow:inset 0 0 0 1px rgba(255,231,203,.20)}
.a-oauth:hover:not(:disabled){background:rgba(255,231,203,.12)}

.a-or{display:flex;align-items:center;gap:1rem;margin:1.35rem 0}
.a-or i{flex:1;height:1px;background:rgba(255,231,203,.14)}
.a-or span{font-size:.8rem;font-weight:700;letter-spacing:.14em;color:var(--txt-mute)}

/* error and success panels, readable on the dark ground rather than pale pink */
.a-error{border-radius:14px;padding:.8rem 1rem;margin-bottom:1.3rem;font-size:.9rem;
  line-height:1.5;color:#FFC9C0;background:rgba(120,32,26,.42);
  box-shadow:inset 0 0 0 1px rgba(255,138,122,.30)}
.a-note{border-radius:14px;padding:.8rem 1rem;margin-bottom:1.3rem;font-size:.9rem;
  line-height:1.5;color:#BFEFE6;background:rgba(20,80,84,.40);
  box-shadow:inset 0 0 0 1px rgba(69,191,203,.28)}

.a-consent{display:flex;gap:.8rem;align-items:flex-start;border-radius:16px;
  padding:.95rem 1rem;margin-bottom:1.3rem;cursor:pointer;
  background:rgba(8,10,22,.42);box-shadow:inset 0 0 0 1px rgba(255,231,203,.13)}
.a-consent:hover{box-shadow:inset 0 0 0 1px rgba(255,231,203,.22)}
.a-consent input{width:20px;height:20px;margin:1px 0 0;flex-shrink:0;
  accent-color:var(--amber-lo);cursor:pointer}
.a-consent span{font-size:.85rem;line-height:1.6;color:var(--txt-dim)}
.a-consent strong{color:var(--txt)}
.a-consent a{color:var(--amber);text-decoration:underline;text-underline-offset:2px}

.a-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem}
.a-link{background:transparent;border:0;padding:0;cursor:pointer;font-family:inherit;
  font-size:.85rem;font-weight:700;color:var(--amber);text-decoration:underline;
  text-underline-offset:3px}
.a-foot{text-align:center;margin-top:1.4rem;padding-top:1.4rem;
  border-top:1px solid rgba(255,231,203,.12);font-size:.92rem;color:var(--txt-dim)}
.a-foot a{color:var(--amber);font-weight:800;text-decoration:none}
.a-foot a:hover{text-decoration:underline}
.a-center{text-align:center;margin-top:1.2rem}

.a-tick{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;
  margin:0 auto 1.1rem;background:rgba(69,191,203,.16);
  box-shadow:inset 0 0 0 1px rgba(69,191,203,.34)}

.a-back{position:relative;margin-top:clamp(20px,3vw,28px);font-size:.88rem;
  color:var(--txt-mute);text-decoration:none}
.a-back:hover{color:var(--txt-dim)}
`;

/** Dark page + logo + card. Children are the card's contents. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="a-page">
      <style>{AUTH_CSS}</style>
      <Link className="a-logo" href="/" aria-label="TalePop home">
        <img
          src="/brand/talepop-lockup.webp"
          alt="TalePop, your story maker"
          width={196}
          height={122}
        />
      </Link>
      <div className="a-card">{children}</div>
      <Link className="a-back" href="/">
        Back to talepopstories.com
      </Link>
    </div>
  );
}

export function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
