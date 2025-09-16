// src/pages/Auth.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import ThemeInput from "../components/ThemeInput";
import AyurvedaButton from "../components/AyurvedaButton";
import ExtraButton from "../components/ExtraButton";
import loginBg from "../assets/login.jpg";
import SignupBg from "../assets/Signup.jpg";

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const imageRef = useRef(null);
  const formRef = useRef(null);

  // controlled fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([formRef.current, imageRef.current], { y: 8, opacity: 0 });
      const tl = gsap.timeline();
      tl.to([formRef.current, imageRef.current], { y: 0, opacity: 1, duration: 0.5, stagger: 0.06 });
      return () => tl.kill();
    }, [formRef, imageRef]);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const d = 0.65;
    if (isLogin) {
      gsap.to(formRef.current, { xPercent: 0, duration: d, ease: "power3.inOut", zIndex: 30 });
      gsap.to(imageRef.current, { xPercent: 0, duration: d, ease: "power3.inOut", zIndex: 20 });
    } else {
      gsap.to(formRef.current, { xPercent: 100, duration: d, ease: "power3.inOut", zIndex: 20 });
      gsap.to(imageRef.current, { xPercent: -100, duration: d, ease: "power3.inOut", zIndex: 30 });
    }
  }, [isLogin]);

  const currentBg = isLogin ? loginBg : SignupBg;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill required fields.");
      return;
    }

    setLoading(true);

    // simulate api call
    setTimeout(() => {
      const token = "demo-token-" + Date.now();
      // if signing up, create a profile with provided name
      const profile = {
        name: isLogin ? (JSON.parse(localStorage.getItem("ayu_profile") || "{}").name || "John Smith") : name,
        email,
        initials:
          isLogin
            ? (JSON.parse(localStorage.getItem("ayu_profile") || "{}").initials || "JS")
            : name
                .split(" ")
                .map((p) => p[0] || "")
                .slice(0, 2)
                .join("")
                .toUpperCase(),
        // optional placeholders — will be enriched in GettingStarted
        gender: undefined,
        dob: undefined,
        height: undefined,
        weight: undefined,
        activity: undefined
      };

      localStorage.setItem("ayu_token", token);
      localStorage.setItem("ayu_profile", JSON.stringify(profile));
      setLoading(false);

      // ROUTING:
      // - if user just signed up, go to getting-started to collect profile details
      // - if user logged in, go to dashboard
      if (isLogin) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/getting-started", { replace: true });
      }
    }, 700);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f6faf5] text-gray-900" style={{ padding: 28 }}>
      <div className="w-full max-w-6xl rounded-2xl shadow-xl overflow-hidden bg-white" style={{ border: "1px solid #eef3ec" }}>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* FORM PANEL */}
          <section ref={formRef} className="p-8 md:p-12 flex items-center" style={{ minHeight: 560, background: "linear-gradient(180deg,#ffffff, #fbfdf8)" }}>
            <div className="w-full max-w-md">
              <div className="flex items-start justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">{isLogin ? "Welcome back" : "Create an account"}</h2>
                  <p className="mt-1 text-sm text-gray-600">{isLogin ? "Sign in to manage your treatments, bookings and follow-ups." : "Create an account to save your plans and personalized programs."}</p>
                </div>

            
              </div>

              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                {!isLogin && <ThemeInput name="name" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />}

                <ThemeInput name="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />

                <ThemeInput name="password" type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} />

                {error && <div className="text-sm text-red-500">{error}</div>}

                <div className="flex flex-col gap-3 mt-2">
                  <AyurvedaButton type="submit" className="w-full" style={{ display: "inline-flex", justifyContent: "center" }}>
                    {loading ? (isLogin ? "Signing in..." : "Creating...") : isLogin ? "Sign in" : "Create account"}
                  </AyurvedaButton>

                  <button type="button" onClick={() => console.log("Google auth (mock)")} className="w-full inline-flex items-center justify-center gap-3 p-3 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md" style={{ boxShadow: "0 1px 6px rgba(16,24,40,0.04)" }}>
                    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
                      <path fill="#FFC107" d="M43.6 20.2H42V20H24v8h11.3C34.9 32.3 30 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l6-6C34.6 3.9 29.6 2 24 2 12.3 2 3 11.3 3 23s9.3 21 21 21c11 0 20-8 21-19.8 0-1 .1-1.6.1-1.7z"/>
                      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.2 19 12 24 12c3.1 0 5.9 1.2 8 3.1l6-6C34.6 3.9 29.6 2 24 2 16.4 2 9.7 6.4 6.3 14.7z"/>
                      <path fill="#4CAF50" d="M24 46c6.6 0 12-2.6 16.3-7l-7.6-6.3C29.1 36.3 26.7 37 24 37c-6 0-10.9-2.7-14.2-6.8L5.9 35.4C9.2 40.8 15.3 46 24 46z"/>
                      <path fill="#1976D2" d="M43.6 20.2H42V20H24v8h11.3c-1.1 2.9-3.1 5.3-5.7 7.1l7.6 6.3C41.2 36.9 44 29.4 44 23c0-1-.1-1.6-.4-2.8z"/>
                    </svg>
                    <span className="text-gray-700 font-medium">{isLogin ? "Sign in with Google" : "Sign up with Google"}</span>
                  </button>
                </div>

                <div className="text-center text-sm text-gray-600 mt-3">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button type="button" onClick={() => setIsLogin((s) => !s)} className="text-sm font-medium text-green-700 underline">
                    {isLogin ? "Sign up" : "Log in"}
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* IMAGE PANEL */}
          <section ref={imageRef} className="relative p-6 md:p-8 flex flex-col justify-between" style={{ minHeight: 560, backgroundImage: `linear-gradient(180deg, rgba(58,125,68,0.06), rgba(58,125,68,0.02)), url(${currentBg})`, backgroundSize: "cover", backgroundPosition: "center" }}>
            <div className="flex justify-end">
            </div>

            <div className="flex-1 flex items-center justify-center mt-4">
              <div className="w-full max-w-md rounded-xl overflow-hidden bg-white/80 border border-gray-100 shadow">
                <img src={currentBg} alt="Promotional media" className="w-full h-96 object-cover" />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900">Capturing Moments, Creating Memories</h3>
              <p className="mt-2 text-sm text-gray-600">A calm, balanced aesthetic blended with Ayurveda-inspired greens.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
