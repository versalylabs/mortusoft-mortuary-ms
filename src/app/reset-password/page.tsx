"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/neon-data/client";
import { hasNeonConfig } from "@/lib/neon-data/config";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice(""); setBusy(true);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) { setNotice("The password could not be updated. Reopen the latest recovery link and try again."); return; }
    await createClient().auth.signOut(); router.replace("/sign-in?password=updated");
  }
  if (!hasNeonConfig()) return <main className="auth-page"><section className="auth-form-side"><div className="auth-form-wrap"><p className="form-eyebrow">PASSWORD RECOVERY</p><h2>Recovery is not configured.</h2><p className="form-intro">Connect the facility identity service to use this page.</p></div></section></main>;
  return <main className="auth-page"><section className="auth-story"><div className="auth-brand"><span className="brand-mark"><i/><i/><i/></span><span>mortusoft<span className="brand-period">.</span></span></div><div className="story-content"><span className="story-kicker"><i/> PRIVATE FACILITY ACCESS</span><h1>A secure return<br/>to your workspace<span>.</span></h1><p>Choose a new password for your facility account.</p></div></section><section className="auth-form-side"><div className="auth-form-wrap"><p className="form-eyebrow">PASSWORD RECOVERY</p><h2>Choose a new<br/>password.</h2><form onSubmit={savePassword}><label>New password<input type="password" autoComplete="new-password" minLength={12} required value={password} onChange={event=>setPassword(event.target.value)}/><small className="inline-help">Use at least 12 characters.</small></label>{notice&&<p className="form-notice" role="status">{notice}</p>}<button className="auth-submit" disabled={busy}>{busy?"Updating…":"Update password"} <span>→</span></button></form><button className="form-back" onClick={()=>router.push("/sign-in")}>Back to sign in</button></div></section></main>;
}

