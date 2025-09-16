// src/pages/GettingStarted.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeInput from "../components/ThemeInput";
import AyurvedaButton from "../components/AyurvedaButton";

/**
 * GettingStarted.jsx (reworked)
 * - Lively background + role selection
 * - Three paths: Member (default multi-step), Doctor (extra details), Administrator (admin code -> panel)
 * - Member flow unchanged from original (kept validation)
 *
 * Notes:
 * - Admin code is matched locally against ADMIN_CODE constant (replace with server check as needed)
 * - Saves profile to localStorage under "ayu_profile"
 */

/* --- Configuration --- */
const ADMIN_CODE = "ADMIN-SECRET-123"; // replace with your real secret / API check

const steps = [
  { id: 1, title: "About you" },
  { id: 2, title: "Body stats" },
  { id: 3, title: "Activity" },
  { id: 4, title: "Review" },
];

function StepDots({ steps, stepIndex, onJump }) {
  return (
    <div className="flex items-center gap-3">
      {steps.map((s, idx) => {
        const isActive = idx === stepIndex;
        const isDone = idx < stepIndex;
        return (
          <button
            key={s.id}
            onClick={() => onJump(idx)}
            className={`w-3 h-3 rounded-full ${isDone ? "bg-green-600" : isActive ? "bg-green-500 scale-105" : "bg-gray-200"} transition-transform`}
            aria-label={`Go to step ${idx + 1}: ${s.title}`}
            title={s.title}
          />
        );
      })}
    </div>
  );
}

/* role card */
function RoleCard({ title, subtitle, icon, active, onClick, colorClass = "bg-emerald-50" }) {
  return (
    <button
      onClick={onClick}
      className={`relative p-5 rounded-2xl border ${active ? "border-emerald-500 shadow-lg" : "border-gray-100"} text-left transition hover:scale-[1.01]`}
      aria-pressed={active}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass} text-2xl`}>{icon}</div>
        <div className="flex-1">
          <div className="text-lg font-semibold text-gray-900">{title}</div>
          <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
        </div>
        <div className="flex items-center">
          {active ? (
            <div className="text-emerald-600 font-semibold">Selected</div>
          ) : (
            <svg className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}

/* animated background decorative component */
function AnimatedBackground() {
  // simple animated blobs + subtle gradient
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-24 -top-24 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-emerald-200/40 via-emerald-300/20 to-transparent blur-3xl animate-blob-slow" />
      <div className="absolute right-[-160px] top-36 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-amber-100/30 via-rose-50/10 to-transparent blur-2xl animate-blob-reverse" />
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        <defs>
          <linearGradient id="g" x1="0" x2="1">
            <stop offset="0%" stopColor="#ecfccb" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#ecfdf5" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)" />
      </svg>

      <style>{`
        @keyframes blob-slow {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(20px) scale(1.05); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes blob-reverse {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-18px) scale(0.98); }
          100% { transform: translateY(0) scale(1); }
        }
        .animate-blob-slow { animation: blob-slow 8s ease-in-out infinite; }
        .animate-blob-reverse { animation: blob-reverse 9s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

/* main page */
export default function GettingStarted() {
  const navigate = useNavigate();

  // high level stage: choose role -> specific flow
  const [role, setRole] = useState(null); // 'member' | 'doctor' | 'admin' | null

  // shared onboarding form state
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState({
    gender: "",
    dob: "",
    heightCm: "",
    weightKg: "",
    activity: "",
    // doctor-specific
    doctor_regNo: "",
    doctor_speciality: "",
    doctor_location: "",
    doctor_practiceSince: "",
    // admin code (transient)
    admin_code: "",
  });
  const [touched, setTouched] = useState({});
  const [adminError, setAdminError] = useState("");
  const [doctorDetailsDone, setDoctorDetailsDone] = useState(false);

  // validators same as before
  const validators = useMemo(
    () => ({
      0: () => !!form.gender && !!form.dob,
      1: () => {
        const h = Number(form.heightCm);
        const w = Number(form.weightKg);
        return h > 40 && h < 300 && w > 10 && w < 500;
      },
      2: () => ["low", "moderate", "high"].includes(form.activity),
      3: () => true,
    }),
    [form]
  );

  const isStepValid = validators[stepIndex]();

  function updateField(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function markTouched(k) {
    setTouched((t) => ({ ...t, [k]: true }));
  }

  function goNext() {
    setTouched({});
    if (stepIndex < steps.length - 1 && isStepValid) {
      setStepIndex((i) => i + 1);
    } else if (stepIndex === steps.length - 1) {
      handleSubmit();
    }
  }

  function goPrev() {
    setTouched({});
    if (stepIndex > 0) setStepIndex((i) => i - 1);
    else if (role === "doctor" && !doctorDetailsDone) {
      // if doctor and on first step go back to doctor details
      setDoctorDetailsDone(false);
    }
  }

  function jumpTo(stepIdx) {
    if (stepIdx <= stepIndex) setStepIndex(stepIdx);
  }

  function handleSubmit() {
    // final validation
    for (let i = 0; i < steps.length - 1; i++) {
      if (!validators[i]()) {
        setStepIndex(i);
        return;
      }
    }

    // build profile object
    const profile = {
      ...form,
      createdAt: new Date().toISOString(),
      role: role || "member",
    };

    localStorage.setItem("ayu_profile", JSON.stringify(profile));
    // route after finishing depends on role
    if (role === "doctor") {
      // doctors go to dashboard for now
      navigate("/dashboard");
    } else if (role === "admin") {
      // admin flow should have validated before allowing submit
      navigate("/admin/panel");
    } else {
      navigate("/dashboard");
    }
  }

  /* --- Role handlers --- */
  function chooseRole(r) {
    setRole(r);
    setAdminError("");
    setStepIndex(0);
    // reset doctorDetailsDone when switching
    setDoctorDetailsDone(false);
  }

  async function handleAdminVerify(e) {
    e?.preventDefault();
    setAdminError("");
    // simple local check (replace with server-side check)
    if (form.admin_code.trim() === ADMIN_CODE) {
      // store admin as profile (or separate auth)
      const profile = { role: "admin", createdAt: new Date().toISOString() };
      localStorage.setItem("ayu_profile", JSON.stringify(profile));
      navigate("/admin/panel");
    } else {
      setAdminError("Invalid admin code. Check and try again.");
    }
  }

  function handleDoctorContinue(e) {
    e?.preventDefault();
    // basic validation for doctor details
    if (!form.doctor_regNo || !form.doctor_speciality) {
      setTouched({ doctor_regNo: true, doctor_speciality: true });
      return;
    }
    // mark done and proceed to member steps so doctor gives personal/body details too
    setDoctorDetailsDone(true);
    setStepIndex(0);
  }

  // helper: calculate age from dob
  function computeAge(dob) {
    if (!dob) return null;
    const b = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - b.getFullYear();
    const m = now.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
    return age;
  }

  const age = computeAge(form.dob);

  /* --- UI --- */
  return (
    <main className="min-h-screen relative bg-gradient-to-b from-emerald-50/40 to-white py-12 px-6">
      <AnimatedBackground />

      <div className="max-w-5xl mx-auto">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative z-10">
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Welcome to AyuVeda</h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">Tell us who you are so we can guide you to the right experience.</p>
              </div>

              <div className="text-sm text-gray-500 hidden sm:block">
                Step{" "}
                <span className="font-medium text-gray-900">
                  {role ? (doctorDetailsDone || role !== "doctor" ? stepIndex + 1 : 0) : 0}
                </span>{" "}
                {role && (doctorDetailsDone || role !== "doctor") ? (
                  <span>
                    of <span className="font-medium">{steps.length}</span>
                  </span>
                ) : (
                  <span>of the role selection</span>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* LEFT: role chooser or form */}
              <section className="md:col-span-2 p-6 rounded-lg bg-white/60 border border-gray-50 shadow-sm">
                {!role && (
                  <>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">I am a</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <RoleCard
                        title="Member"
                        subtitle="Personalized diet & lifestyle plans"
                        icon="🍲"
                        onClick={() => chooseRole("member")}
                        colorClass="bg-emerald-50"
                      />
                      <RoleCard
                        title="Doctor / Healthcare pro"
                        subtitle="Provide professional insights & manage patients"
                        icon="🩺"
                        onClick={() => chooseRole("doctor")}
                        colorClass="bg-amber-50"
                      />
                      <RoleCard
                        title="Administrator"
                        subtitle="Manage the platform"
                        icon="⚙️"
                        onClick={() => chooseRole("admin")}
                        colorClass="bg-rose-50"
                      />
                    </div>

                    <div className="mt-6 text-sm text-gray-500">Choose the role that best describes you to continue.</div>
                  </>
                )}

                {/* ADMIN path */}
                {role === "admin" && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Administrator sign-in</h2>
                    <form onSubmit={handleAdminVerify} className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm max-w-md">
                      <label className="block text-xs text-gray-500 mb-2">Enter unique admin code</label>
                      <ThemeInput
                        value={form.admin_code}
                        onChange={(e) => updateField("admin_code", e.target.value)}
                        className="mb-3"
                        placeholder="Enter admin code"
                      />
                      {adminError && <div className="text-sm text-rose-600 mb-2">{adminError}</div>}
                      <div className="flex gap-3">
                        <AyurvedaButton type="submit">Verify & Continue</AyurvedaButton>
                        <button
                          type="button"
                          onClick={() => {
                            // go back to role selection
                            setRole(null);
                            setForm((s) => ({ ...s, admin_code: "" }));
                            setAdminError("");
                          }}
                          className="px-4 py-2 rounded-md bg-gray-100 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-3">If code is valid, you'll be taken to the admin panel.</div>
                    </form>
                  </div>
                )}

                {/* DOCTOR path initial details */}
                {role === "doctor" && !doctorDetailsDone && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Doctor details</h2>
                    <form onSubmit={handleDoctorContinue} className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm space-y-3 max-w-2xl">
                      <div>
                        <label className="block text-xs text-gray-500">Registration / License number</label>
                        <ThemeInput
                          placeholder="e.g. REG-12345"
                          value={form.doctor_regNo}
                          onChange={(e) => updateField("doctor_regNo", e.target.value)}
                        />
                        {touched.doctor_regNo && !form.doctor_regNo && <div className="text-sm text-rose-500 mt-1">Required</div>}
                      </div>

                      <div>
                        <label className="block text-xs text-gray-500">Speciality</label>
                        <ThemeInput
                          placeholder="e.g. Ayurveda, Dietician, General Physician"
                          value={form.doctor_speciality}
                          onChange={(e) => updateField("doctor_speciality", e.target.value)}
                        />
                        {touched.doctor_speciality && !form.doctor_speciality && <div className="text-sm text-rose-500 mt-1">Required</div>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500">Clinic location</label>
                          <ThemeInput placeholder="City, Country" value={form.doctor_location} onChange={(e) => updateField("doctor_location", e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Practicing since</label>
                          <ThemeInput placeholder="Year e.g. 2015" value={form.doctor_practiceSince} onChange={(e) => updateField("doctor_practiceSince", e.target.value)} />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <AyurvedaButton type="submit">Continue to profile</AyurvedaButton>
                        <button
                          type="button"
                          onClick={() => {
                            setRole(null);
                            setForm((s) => ({ ...s, doctor_regNo: "", doctor_speciality: "" }));
                          }}
                          className="px-4 py-2 rounded-md bg-gray-100 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* MEMBER path (or doctor when doctorDetailsDone === true) -> show multi-step */}
                {((role === "member") || (role === "doctor" && doctorDetailsDone)) && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">{steps[stepIndex].title}</h2>

                    <div className="mt-3">
                      <StepDots steps={steps} stepIndex={stepIndex} onJump={jumpTo} />
                    </div>

                    <div className="mt-6 bg-white p-6 rounded-lg border border-gray-50 shadow-sm">
                      {/* Step 1 */}
                      {stepIndex === 0 && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                            <div className="flex gap-2">
                              {["female", "male", "other"].map((g) => (
                                <button
                                  key={g}
                                  type="button"
                                  onClick={() => updateField("gender", g)}
                                  onBlur={() => markTouched("gender")}
                                  className={`px-3 py-2 rounded-md border ${form.gender === g ? "bg-green-600 text-white border-transparent" : "bg-white text-gray-700 border-gray-200"}`}
                                  aria-pressed={form.gender === g}
                                >
                                  {g[0].toUpperCase() + g.slice(1)}
                                </button>
                              ))}
                            </div>
                            {touched.gender && !form.gender && <div className="text-red-500 text-sm mt-1">Please choose your gender</div>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date of birth</label>
                            <ThemeInput
                              type="date"
                              value={form.dob}
                              onChange={(e) => updateField("dob", e.target.value)}
                              onBlur={() => markTouched("dob")}
                              className="max-w-xs"
                              aria-label="Date of birth"
                            />
                            {touched.dob && !form.dob && <div className="text-red-500 text-sm mt-1">Please enter your date of birth</div>}
                            {age !== null && age < 10 && <div className="text-sm text-orange-600 mt-1">If you are under 10, please consult a practitioner.</div>}
                          </div>
                        </div>
                      )}

                      {/* Step 2 */}
                      {stepIndex === 1 && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                            <ThemeInput
                              type="number"
                              min="40"
                              max="300"
                              value={form.heightCm}
                              onChange={(e) => updateField("heightCm", e.target.value)}
                              onBlur={() => markTouched("heightCm")}
                              placeholder="e.g. 170"
                              className="max-w-xs"
                            />
                            {touched.heightCm && !(Number(form.heightCm) > 40 && Number(form.heightCm) < 300) && (
                              <div className="text-red-500 text-sm mt-1">Enter a valid height (cm)</div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                            <ThemeInput
                              type="number"
                              min="10"
                              max="500"
                              value={form.weightKg}
                              onChange={(e) => updateField("weightKg", e.target.value)}
                              onBlur={() => markTouched("weightKg")}
                              placeholder="e.g. 68"
                              className="max-w-xs"
                            />
                            {touched.weightKg && !(Number(form.weightKg) > 10 && Number(form.weightKg) < 500) && (
                              <div className="text-red-500 text-sm mt-1">Enter a valid weight (kg)</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Step 3 */}
                      {stepIndex === 2 && (
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Activity level</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                              { key: "low", title: "Low", desc: "Sedentary or little exercise" },
                              { key: "moderate", title: "Moderate", desc: "Exercise 3-5 days/week" },
                              { key: "high", title: "High", desc: "Daily intense exercise" },
                            ].map((a) => (
                              <button
                                key={a.key}
                                type="button"
                                onClick={() => updateField("activity", a.key)}
                                onBlur={() => markTouched("activity")}
                                className={`p-4 rounded-lg text-left border ${form.activity === a.key ? "bg-green-50 border-green-200" : "bg-white border-gray-100"}`}
                                aria-pressed={form.activity === a.key}
                              >
                                <div className="font-medium text-gray-900">{a.title}</div>
                                <div className="text-xs text-gray-500 mt-1">{a.desc}</div>
                              </button>
                            ))}
                          </div>
                          {touched.activity && !form.activity && <div className="text-red-500 text-sm mt-1">Pick an activity level</div>}
                        </div>
                      )}

                      {/* Step 4 */}
                      {stepIndex === 3 && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium text-gray-700">Review your details</h3>

                          <div className="bg-gray-50 border border-gray-100 rounded-md p-4">
                            <dl className="grid grid-cols-1 gap-3">
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-600">Gender</dt>
                                <dd className="font-medium text-gray-900">{form.gender || "—"}</dd>
                              </div>

                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-600">Date of birth</dt>
                                <dd className="font-medium text-gray-900">{form.dob ? new Date(form.dob).toLocaleDateString() : "—"}</dd>
                              </div>

                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-600">Age</dt>
                                <dd className="font-medium text-gray-900">{age ?? "—"}</dd>
                              </div>

                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-600">Height</dt>
                                <dd className="font-medium text-gray-900">{form.heightCm ? `${form.heightCm} cm` : "—"}</dd>
                              </div>

                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-600">Weight</dt>
                                <dd className="font-medium text-gray-900">{form.weightKg ? `${form.weightKg} kg` : "—"}</dd>
                              </div>

                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-600">Activity</dt>
                                <dd className="font-medium text-gray-900">{form.activity || "—"}</dd>
                              </div>

                              {role === "doctor" && (
                                <>
                                  <div className="flex justify-between">
                                    <dt className="text-sm text-gray-600">Registration</dt>
                                    <dd className="font-medium text-gray-900">{form.doctor_regNo || "—"}</dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-sm text-gray-600">Speciality</dt>
                                    <dd className="font-medium text-gray-900">{form.doctor_speciality || "—"}</dd>
                                  </div>
                                </>
                              )}
                            </dl>
                          </div>

                          <div className="text-sm text-gray-500">Tips: you can edit any step by clicking on the dots above or using the Back button.</div>
                        </div>
                      )}

                      {/* nav */}
                      <div className="mt-6 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={goPrev}
                          disabled={stepIndex === 0}
                          className={`px-4 py-2 rounded-md border ${stepIndex === 0 ? "text-gray-400 border-gray-100" : "text-gray-700 border-gray-200 hover:shadow-sm"}`}
                        >
                          Back
                        </button>

                        <AyurvedaButton type="button" onClick={goNext} disabled={!isStepValid}>
                          {stepIndex === steps.length - 1 ? "Finish & save" : "Next"}
                        </AyurvedaButton>

                        <button
                          type="button"
                          onClick={() => {
                            setForm({ gender: "", dob: "", heightCm: "", weightKg: "", activity: "" });
                            setStepIndex(0);
                          }}
                          className="ml-auto text-sm text-gray-500 hover:underline"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* RIGHT: help & context (common) */}
              <aside className="md:col-span-1 bg-white p-4 rounded-lg border border-gray-50 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Why we ask this</h4>
                <p className="text-xs text-gray-600 mb-3">Details like age, body size and activity help us tailor diet & lifestyle suggestions to your needs.</p>

                {role === "doctor" && !doctorDetailsDone ? (
                  <>
                    <h5 className="text-sm font-semibold text-gray-900 mb-1">Doctor tips</h5>
                    <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                      <li>Provide a valid registration number for verification.</li>
                      <li>Adding clinic location helps your patients discover you.</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <h5 className="text-sm font-semibold text-gray-900 mb-1">Quick tips</h5>
                    <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                      <li>Use your typical activity level (average week).</li>
                      <li>Enter height in centimetres for best results.</li>
                      <li>Weight in kilograms — we'll convert if needed.</li>
                    </ul>
                  </>
                )}

                <div className="mt-4">
                  <button
                    onClick={() => {
                      setRole(null);
                      setForm({
                        gender: "",
                        dob: "",
                        heightCm: "",
                        weightKg: "",
                        activity: "",
                        doctor_regNo: "",
                        doctor_speciality: "",
                        doctor_location: "",
                        doctor_practiceSince: "",
                        admin_code: "",
                      });
                      setDoctorDetailsDone(false);
                    }}
                    className="text-xs text-gray-500 underline"
                  >
                    Start over
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
