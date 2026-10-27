"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/neon-data/client";
import { hasNeonConfig } from "@/lib/neon-data/config";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    const signOut = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest(".signout-link")) return;
      event.preventDefault(); event.stopImmediatePropagation();
      createClient().auth.signOut().finally(() => { localStorage.removeItem("mortusoft-demo-session"); router.replace("/sign-in"); router.refresh(); });
    };
    if (hasNeonConfig()) document.addEventListener("click", signOut, true);
    async function prepare() {
      if (hasNeonConfig()) {
        const { data: { user } } = await createClient().auth.getUser();
        if (!user) { router.replace("/sign-in"); return; }
        if (active) setReady(true);
        return;
      }
      if (!localStorage.getItem("mortusoft-demo-session")) router.replace("/sign-in");
      else if (active) setReady(true);
    }
    prepare().catch(() => router.replace("/sign-in"));
    return () => { active = false; document.removeEventListener("click", signOut, true); };
  }, [router]);
  if (!ready) return <div className="auth-loading"><span className="brand-mark"><i/><i/><i/></span><span>Preparing your workspaceâ€¦</span></div>;
  return children;
}

