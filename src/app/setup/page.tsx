"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGate from "../components/AuthGate";
import AppShell from "../components/AppShell";

const initial = {
  name: "Nairobi Memorial",
  type: "Private mortuary",
  county: "Nairobi",
  email: "admin@nairobi-memorial.example",
  phone: "+254 700 000 000",
  casePrefix: "MRT",
  timezone: "Africa/Nairobi"
};

const steps = ["Facility profile", "Case numbering", "Review & save"];

function SetupContent() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [facility, setFacility] = useState(initial);

  useEffect(() => {
    const data = localStorage.getItem("mortusoft-demo-facility");
    if (data) {
      try {
        setFacility({ ...initial, ...JSON.parse(data) });
      } catch {
        // default
      }
    }
  }, []);

  const change = (key: keyof typeof initial, value: string) =>
    setFacility((old) => ({ ...old, [key]: value }));

  function save() {
    localStorage.setItem("mortusoft-demo-facility", JSON.stringify(facility));
    setSaved(true);
  }

  return (
    <AppShell active="Settings">
      <div className="page-heading">
        <div>
          <p className="eyebrow">FACILITY CONFIGURATION <span>·</span> PREFERENCES & NUMBERING</p>
          <h1>Facility Settings<span>.</span></h1>
          <p className="heading-subtitle">Configure your facility identity, case prefix series, and regional time zone.</p>
        </div>
      </div>

      <div className="workspace-layout">
        <aside className="workspace-rail">
          <p className="rail-eyebrow">WORKSPACE SETTINGS</p>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", margin: "4px 0 10px" }}>Make it yours.</h2>
          <p className="rail-copy">Set up the details your team will use every day.</p>
          <div className="step-list">
            {steps.map((label, i) => (
              <div
                key={label}
                className={`step-item ${step === i ? "step-current" : ""} ${step > i ? "step-done" : ""}`}
              >
                <span>{step > i ? "✓" : `0${i + 1}`}</span>
                <b>{label}</b>
              </div>
            ))}
          </div>
          <div className="rail-help">
            <span>✳</span>
            <b>Need a hand?</b>
            <p>Facility setup usually takes about 3 minutes.</p>
          </div>
        </aside>

        <section className="setup-main">
          <div className="setup-card">
            <div className="setup-heading">
              <div>
                <p className="form-eyebrow">STEP 0{step + 1} OF 03</p>
                <h2>{step === 0 ? "Facility profile" : step === 1 ? "Case numbering" : "Review & save"}</h2>
                <p>
                  {step === 0
                    ? "The details that identify your facility across Mortusoft."
                    : step === 1
                    ? "Choose a clear, consistent format for new case IDs."
                    : "Confirm your facility setup before saving."}
                </p>
              </div>
              <span className="setup-icon">{step === 0 ? "⌂" : step === 1 ? "#" : "✓"}</span>
            </div>

            {saved ? (
              <div className="save-success">
                <span>✓</span>
                <h3>Facility profile saved</h3>
                <p>Your local demo workspace is updated. You can change these details any time.</p>
                <button className="auth-submit" onClick={() => router.push("/")}>
                  Return to overview <span>→</span>
                </button>
              </div>
            ) : (
              <>
                {step === 0 && (
                  <div className="form-grid">
                    <label className="field-wide">
                      Facility name
                      <input
                        value={facility.name}
                        onChange={(e) => change("name", e.target.value)}
                        placeholder="e.g. Nairobi Memorial"
                      />
                    </label>
                    <label>
                      Facility type
                      <select value={facility.type} onChange={(e) => change("type", e.target.value)}>
                        <option>Private mortuary</option>
                        <option>Funeral home</option>
                        <option>Hospital mortuary</option>
                        <option>County / public mortuary</option>
                        <option>Faith-based funeral home</option>
                      </select>
                    </label>
                    <label>
                      County / region
                      <select value={facility.county} onChange={(e) => change("county", e.target.value)}>
                        <option>Nairobi</option>
                        <option>Kiambu</option>
                        <option>Mombasa</option>
                        <option>Kisumu</option>
                        <option>Nakuru</option>
                        <option>Other</option>
                      </select>
                    </label>
                    <label>
                      Facility contact email
                      <input
                        type="email"
                        value={facility.email}
                        onChange={(e) => change("email", e.target.value)}
                      />
                    </label>
                    <label>
                      Facility phone
                      <input
                        value={facility.phone}
                        onChange={(e) => change("phone", e.target.value)}
                      />
                    </label>
                    <label className="field-wide">
                      Time zone
                      <select
                        value={facility.timezone}
                        onChange={(e) => change("timezone", e.target.value)}
                      >
                        <option value="Africa/Nairobi">East Africa Time (UTC+3) · Nairobi</option>
                        <option value="Africa/Kampala">East Africa Time (UTC+3) · Kampala</option>
                      </select>
                    </label>
                  </div>
                )}

                {step === 1 && (
                  <div className="numbering-panel">
                    <div className="numbering-copy">
                      <span>CASE ID PREVIEW</span>
                      <strong>{facility.casePrefix || "MRT"}-00001</strong>
                      <small>Each new case will receive the next available number.</small>
                    </div>
                    <label>
                      Case number prefix
                      <input
                        value={facility.casePrefix}
                        maxLength={6}
                        onChange={(e) =>
                          change("casePrefix", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                        }
                        placeholder="MRT"
                      />
                      <small>Use up to 6 letters or numbers.</small>
                    </label>
                    <div className="setup-hint">
                      Case numbers are unique within this facility. Prefix changes apply to new admissions.
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="review-list">
                    {[
                      ["Facility", facility.name],
                      ["Type", facility.type],
                      ["Location", facility.county + ", Kenya"],
                      ["Contact", facility.email],
                      ["Phone", facility.phone],
                      ["Case number format", `${facility.casePrefix || "MRT"}-00001`],
                      ["Time zone", facility.timezone]
                    ].map(([a, b]) => (
                      <div key={a}>
                        <span>{a}</span>
                        <b>{b}</b>
                        {a === "Facility" && <button onClick={() => setStep(0)}>Edit</button>}
                      </div>
                    ))}
                    <div className="setup-hint">
                      This saves to this browser for demonstration. Add a secure backend before entering real facility or case information.
                    </div>
                  </div>
                )}

                <div className="setup-actions">
                  {step > 0 ? (
                    <button className="subtle-button" onClick={() => setStep(step - 1)}>
                      ← Previous
                    </button>
                  ) : (
                    <button className="subtle-button" onClick={() => router.push("/")}>
                      Cancel
                    </button>
                  )}
                  {step < 2 ? (
                    <button className="auth-submit setup-next" onClick={() => setStep(step + 1)}>
                      Continue <span>→</span>
                    </button>
                  ) : (
                    <button className="auth-submit setup-next" onClick={save}>
                      Save facility profile <span>✓</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
          <p className="setup-footnote">Your facility information is only stored in this browser during the prototype.</p>
        </section>
      </div>
    </AppShell>
  );
}

export default function Setup() {
  return (
    <AuthGate>
      <SetupContent />
    </AuthGate>
  );
}
