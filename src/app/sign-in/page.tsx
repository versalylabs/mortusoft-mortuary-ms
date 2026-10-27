"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { hasNeonConfig } from "@/lib/neon/config";
import ProductionSignIn from "./ProductionSignIn";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("angela@nairobi-memorial.example");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  if (hasNeonConfig()) return <ProductionSignIn />;
  function enterDemo(event?: FormEvent) {
    event?.preventDefault();
    if (event && (!email.includes("@") || password.length < 6)) {
      setNotice("Enter an email address and a password of at least 6 characters to continue.");
      return;
    }
    localStorage.setItem("mortusoft-demo-session", JSON.stringify({ email, name: "Angela Muthoni", role: "Facility administrator", demo: true }));
    router.replace("/");
  }
  return <main className="auth-page"><section className="auth-story"><div className="auth-brand"><span className="brand-mark"><i/><i/><i/></span><span>mortusoft<span className="brand-period">.</span></span></div><div className="story-content"><span className="story-kicker"><i/> A MORE CONSIDERED WAY TO CARE</span><h1>Every detail,<br/>held with care<span>.</span></h1><p>One calm, connected workspace for the people who keep everything moving.</p><div className="story-rule"/><div className="story-quote">â€œThe right information, in the right hands, at the right moment.â€</div><div className="story-foot"><span>DESIGNED FOR THE PEOPLE BEHIND THE CARE</span><span>01 â€” 03</span></div></div><div className="auth-art"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-cross">âœ³</div><div className="art-caption">A quieter kind of clarity</div></div></section><section className="auth-form-side"><div className="form-topline"><span>FACILITY WORKSPACE</span><span>KENYA <i>Â·</i> EAT</span></div><div className="auth-form-wrap"><div className="form-symbol"><span>â†—</span></div><p className="form-eyebrow">WELCOME BACK</p><h2>Sign in to your<br/>workspace.</h2><p className="form-intro">Use your facility account to continue.</p><form onSubmit={enterDemo}><label>Email address<input autoComplete="username" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@facility.com" required/></label><label>Password<input autoComplete="current-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required minLength={6}/></label><div className="form-options"><label className="remember-label"><input type="checkbox" defaultChecked/> Keep me signed in</label><button type="button" onClick={()=>setNotice("Password recovery will be connected when authentication is enabled.")}>Forgot password?</button></div>{notice&&<p className="form-notice" role="status">{notice}</p>}<button type="submit" className="auth-submit">Continue to workspace <span>â†’</span></button></form><div className="auth-separator"><span/> <small>OR</small> <span/></div><button className="demo-button" onClick={()=>enterDemo()}><span>â†—</span> Explore the demo workspace</button><div className="demo-note"><b>PREVIEW MODE</b><span>Sign-in is simulated for this local preview. No credentials are sent or stored as real account data.</span></div></div><div className="auth-footer"><span>Â© 2026 Mortusoft</span><span>Privacy &nbsp;Â·&nbsp; Support</span></div></section></main>;
}

