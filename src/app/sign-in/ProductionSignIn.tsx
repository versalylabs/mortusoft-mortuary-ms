"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/neon-data/client";

export default function ProductionSignIn() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice(""); setBusy(true);
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) { setNotice("We couldn't sign you in. Check your facility account details and try again."); return; }
    const next = search.get("next") || "/";
    router.replace(next.startsWith("/") && !next.startsWith("//") ? next : "/"); router.refresh();
  }

  async function resetPassword() {
    if (!email.includes("@")) { setNotice("Enter your work email first, then choose password recovery."); return; }
    const { error } = await createClient().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` });
    setNotice(error ? "Password recovery could not be started. Contact your facility administrator." : "If password recovery is enabled, a secure link will be sent to your work email.");
  }

  return <main className="auth-page">
    <section className="auth-story"><div className="auth-brand"><span className="brand-mark"><i/><i/><i/></span><span>mortusoft<span className="brand-period">.</span></span></div><div className="story-content"><span className="story-kicker"><i/> A MORE CONSIDERED WAY TO CARE</span><h1>Every detail,<br/>held with care<span>.</span></h1><p>One calm, connected workspace for the people who keep everything moving.</p><div className="story-rule"/><div className="story-quote">â€œThe right information, in the right hands, at the right moment.â€</div><div className="story-foot"><span>DESIGNED FOR THE PEOPLE BEHIND THE CARE</span><span>01 â€” 03</span></div></div><div className="auth-art"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-cross">âœ³</div><div className="art-caption">A quieter kind of clarity</div></div></section>
    <section className="auth-form-side"><div className="form-topline"><span>FACILITY WORKSPACE</span><span>KENYA <i>Â·</i> EAT</span></div><div className="auth-form-wrap"><div className="form-symbol"><span>â†—</span></div><p className="form-eyebrow">SECURE FACILITY ACCESS</p><h2>Sign in to your<br/>workspace.</h2><p className="form-intro">Use the account provided by your facility administrator.</p><form onSubmit={signIn}><label>Work email<input autoComplete="username" type="email" value={email} onChange={event=>setEmail(event.target.value)} required/></label><label>Password<input autoComplete="current-password" type="password" value={password} onChange={event=>setPassword(event.target.value)} required/></label><div className="form-options"><label className="remember-label"><input type="checkbox" defaultChecked/> Keep me signed in</label><button type="button" onClick={resetPassword}>Forgot password?</button></div>{notice&&<p className="form-notice" role="status">{notice}</p>}<button type="submit" className="auth-submit" disabled={busy}>{busy?"Signing inâ€¦":"Continue to workspace"} <span>â†’</span></button></form><div className="demo-note"><b>PRIVATE WORKSPACE</b><span>Authentication is handled by the facility identity service. Access to facility records is enforced separately by database policies.</span></div></div><div className="auth-footer"><span>Â© 2026 Mortusoft</span><span>Facility access</span></div></section>
  </main>;
}

