// src/pages/Auth.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { gsap } from "gsap";
import ThemeInput from "../components/ThemeInput";
import AyurvedaButton from "../components/AyurvedaButton";
import loginBg from "../assets/login.jpg";
import SignupBg from "../assets/Signup.jpg";
import axios from "axios";

export default function Auth() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("login"); // login, signup, otp, forgotPassword, resetPassword, gettingStarted
  const imageRef = useRef(null);
  const formRef = useRef(null);
  const inputsRef = useRef([]);

  // controlled fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP specific states
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Getting Started form states
  const [gettingStartedForm, setGettingStartedForm] = useState({
    name: "",
    gender: "",
    dob: "",
    height: "",
    weight: "",
    activity: "",
  });

  const API = "http://localhost:5001/api/auth";

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([formRef.current, imageRef.current], { y: 8, opacity: 0 });
      const tl = gsap.timeline();
      tl.to([formRef.current, imageRef.current], {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.06,
      });
      return () => tl.kill();
    }, [formRef, imageRef]);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const d = 0.65;
    const isLogin = currentView === "login";
    if (isLogin) {
      gsap.to(formRef.current, {
        xPercent: 0,
        duration: d,
        ease: "power3.inOut",
        zIndex: 30,
      });
      gsap.to(imageRef.current, {
        xPercent: 0,
        duration: d,
        ease: "power3.inOut",
        zIndex: 20,
      });
    } else {
      gsap.to(formRef.current, {
        xPercent: 100,
        duration: d,
        ease: "power3.inOut",
        zIndex: 20,
      });
      gsap.to(imageRef.current, {
        xPercent: -100,
        duration: d,
        ease: "power3.inOut",
        zIndex: 30,
      });
    }
  }, [currentView]);

  // Cooldown timer for resend OTP
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Auto-focus first OTP input when OTP view is active
  useEffect(() => {
    if (currentView === "otp") {
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
    }
  }, [currentView]);

  // Set name in getting started form when available
  useEffect(() => {
    if (name && currentView === "gettingStarted") {
      setGettingStartedForm(prev => ({ ...prev, name }));
    }
  }, [name, currentView]);

  const currentBg = currentView === "login" ? loginBg : SignupBg;

  // Clear form data
  const clearForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setNewPassword("");
    setError("");
    setInfo("");
    setOtpValues(["", "", "", "", "", ""]);
    setGettingStartedForm({
      name: "",
      gender: "",
      dob: "",
      height: "",
      weight: "",
      activity: "",
    });
  };

  // Handle view changes
  const switchView = (view) => {
    if (view !== "gettingStarted") {
      clearForm();
    }
    setCurrentView(view);
  };

  // OTP handling functions
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedData.length >= 6) {
      const newOtp = pastedData.slice(0, 6).split("");
      setOtpValues(newOtp);
      inputsRef.current[5]?.focus();
    }
  };

  // Main form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (currentView === "login") {
      await handleLogin();
    } else if (currentView === "signup") {
      await handleSignup();
    } else if (currentView === "otp") {
      await handleOtpVerification();
    } else if (currentView === "forgotPassword") {
      await handleForgotPassword();
    } else if (currentView === "resetPassword") {
      await handleResetPassword();
    } else if (currentView === "gettingStarted") {
      await handleGettingStartedSubmit();
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/signin`, { email, password });
      console.log(res);
      const { token, name: userName, dob, height, weight } = res.data.user;

      localStorage.setItem("ayu_token", token);
      localStorage.setItem(
        "ayu_profile",
        JSON.stringify({
          name: userName,
          email: email,
          dob: dob ? new Date(dob).toISOString().split("T")[0] : "", // Convert timestamp to date
          // gender: gender || "male",
          height: height || "", // Ensure valid height
          weight: weight || "", // Ensure valid weight
        })
      );


      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/signup`, {
        name,
        email,
        password,
        confirmPassword
      });

      setInfo("Account created! Please verify your email with the OTP sent.");
      setCooldown(60);
      setTimeout(() => setCurrentView("otp"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    const otpString = otpValues.join("");
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setVerifying(true);
    try {
      await axios.post(`${API}/verifyotp`, {
        email,
        otp: otpString,
      });

      setInfo("Email verified successfully! Let's complete your profile.");
      setTimeout(() => setCurrentView("gettingStarted"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/forgotpassword`, { email });
      setInfo("OTP sent to your email for password reset.");
      setCooldown(60);
      setTimeout(() => setCurrentView("resetPassword"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const otpString = otpValues.join("");
    if (!email || otpString.length !== 6 || !newPassword || !confirmPassword) {
      setError("Please fill all required fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/resetpassword`, {
        email,
        otp: otpString,
        newPassword,
        confirmPassword,
      });

      setInfo("Password reset successfully!");
      setTimeout(() => setCurrentView("login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGettingStartedSubmit = async () => {
    const { name, gender, dob, height, weight } = gettingStartedForm;

    if (!name || !gender || !dob || !height || !weight) {
      setError("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      // First, get the user ID by finding the user with the email
      const userResponse = await axios.get(`${API}/user/${encodeURIComponent(email)}`);
      const userId = userResponse.data.user._id;

      // Then update the profile
      const response = await axios.put(
        `${API}/updateprofile/${userId}`,
        {
          height: parseFloat(height),
          weight: parseFloat(weight),
          gender,
          dob
        }
      );

      if (response.status === 200) {
        setInfo("Profile updated successfully! Redirecting to login...");
        setTimeout(() => setCurrentView("login"), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (sending || cooldown > 0) return;

    setSending(true);
    setError("");

    try {
      if (currentView === "otp") {
        // Resend signup OTP
        await axios.post(`${API}/signup`, {
          name,
          email,
          password,
          confirmPassword: password
        });
      } else if (currentView === "resetPassword") {
        // Resend forgot password OTP
        await axios.post(`${API}/forgotpassword`, { email });
      }

      setInfo("New OTP sent to your email");
      setCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setSending(false);
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  // Render different form content based on current view
  const renderFormContent = () => {
    if (currentView === "gettingStarted") {
      return (
        <div className="w-full max-w-md">
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                Complete Your Profile
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Help us personalize your Ayurveda experience with a few details.
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <ThemeInput
              name="name"
              placeholder="Full name"
              value={gettingStartedForm.name}
              onChange={(e) => setGettingStartedForm(prev => ({ ...prev, name: e.target.value }))}
            />

            <div>
              <select
                value={gettingStartedForm.gender}
                onChange={(e) => setGettingStartedForm(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={gettingStartedForm.dob}
                onChange={(e) => setGettingStartedForm(prev => ({ ...prev, dob: e.target.value }))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                max={new Date().toISOString().split('T')[0]} // Prevent future dates
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <ThemeInput
                  name="height"
                  type="number"
                  placeholder="Height (cm)"
                  value={gettingStartedForm.height}
                  onChange={(e) => setGettingStartedForm(prev => ({ ...prev, height: e.target.value }))}
                  min="100"
                  max="250"
                />
              </div>
              <div>
                <ThemeInput
                  name="weight"
                  type="number"
                  placeholder="Weight (kg)"
                  value={gettingStartedForm.weight}
                  onChange={(e) => setGettingStartedForm(prev => ({ ...prev, weight: e.target.value }))}
                  min="30"
                  max="300"
                />
              </div>
            </div>

            <div>
              <select
                value={gettingStartedForm.activity}
                onChange={(e) => setGettingStartedForm(prev => ({ ...prev, activity: e.target.value }))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="">Activity Level (Optional)</option>
                <option value="sedentary">Sedentary (little to no exercise)</option>
                <option value="light">Light (exercise 1-3 days/week)</option>
                <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                <option value="active">Active (exercise 6-7 days/week)</option>
                <option value="very_active">Very Active (intense exercise daily)</option>
              </select>
            </div>

            {error && <div className="text-sm text-red-500">{error}</div>}
            {info && <div className="text-sm text-green-600">{info}</div>}

            {/* Show calculated age if DOB is entered */}
            {gettingStartedForm.dob && (
              <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                Age: {calculateAge(gettingStartedForm.dob)} years
              </div>
            )}

            <div className="flex flex-col gap-3 mt-6">
              <AyurvedaButton
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Saving Profile..." : "Complete Profile"}
              </AyurvedaButton>
            </div>

            <div className="text-center text-sm text-gray-600 mt-3">
              Want to fill this later?{" "}
              <button
                type="button"
                onClick={() => setCurrentView("login")}
                className="text-sm font-medium text-green-700 underline"
              >
                Go to Login
              </button>
            </div>
          </form>
        </div>
      );
    }

    if (currentView === "otp") {
      return (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border p-6">
          {/* Greeting */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              {name ? `Hey ${name.split(" ")[0]},` : "Hey there,"}
            </h2>
            <p className="text-sm text-gray-600">Check your email — enter the 6-digit code below to finish signing up.</p>
            {email && <div className="mt-2 text-xs text-gray-500">Code sent to <strong>{email}</strong></div>}
          </div>

          {/* Info / error */}
          {info && <div className="text-sm text-green-700 mb-3 text-center">{info}</div>}
          {error && <div className="text-sm text-red-600 mb-3 text-center">{error}</div>}

          {/* OTP inputs */}
          <form onSubmit={handleSubmit} onPaste={handleOtpPaste}>
            <div className="flex justify-center gap-2 mb-4">
              {otpValues.map((val, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  value={val}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otpValues[i] && i > 0) inputsRef.current[i - 1]?.focus();
                    else if (e.key === "ArrowLeft" && i > 0) inputsRef.current[i - 1]?.focus();
                    else if (e.key === "ArrowRight" && i < 5) inputsRef.current[i + 1]?.focus();
                  }}
                  className="w-12 h-12 text-center border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  aria-label={`OTP digit ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <AyurvedaButton type="submit" className="flex-1" disabled={verifying}>
                {verifying ? "Verifying..." : "Verify"}
              </AyurvedaButton>
            </div>

            <div className="mt-3 text-center text-sm">
              {cooldown > 0 ? (
                <>Didn't get OTP? Resend available in <strong>{cooldown}s</strong>.</>
              ) : (
                <button
                  type="button"
                  onClick={resendOtp}
                  className="text-green-700 underline"
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Didn't get OTP? Resend"}
                </button>
              )}
            </div>
          </form>

          <div className="mt-4 text-center text-xs text-gray-500">
            {cooldown > 0 ? (
              <>Check spam if you don't see the email.</>
            ) : (
              <>If you still don't receive it, try again or contact support.</>
            )}
          </div>

          <div className="mt-4 text-center text-sm">
            <button
              onClick={() => switchView("signup")}
              className="text-green-700 underline"
            >
              Go back to signup
            </button>
          </div>
        </div>
      );
    }

    if (currentView === "resetPassword") {
      return (
        <div className="w-full max-w-md">
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                Reset Password
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Enter the OTP sent to your email and your new password.
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} onPaste={handleOtpPaste}>
            {/* OTP inputs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-digit OTP
              </label>
              <div className="flex justify-center gap-2 mb-4">
                {otpValues.map((val, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    value={val}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="w-12 h-12 text-center border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                  />
                ))}
              </div>
            </div>

            <ThemeInput
              name="newPassword"
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <ThemeInput
              name="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && <div className="text-sm text-red-500">{error}</div>}
            {info && <div className="text-sm text-green-600">{info}</div>}

            <div className="flex flex-col gap-3 mt-2">
              <AyurvedaButton
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </AyurvedaButton>
            </div>

            <div className="mt-3 text-center text-sm">
              {cooldown > 0 ? (
                <>Didn't get OTP? Resend available in <strong>{cooldown}s</strong>.</>
              ) : (
                <button
                  type="button"
                  onClick={resendOtp}
                  className="text-green-700 underline"
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Resend OTP"}
                </button>
              )}
            </div>

            <div className="text-center text-sm text-gray-600 mt-3">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => switchView("login")}
                className="text-sm font-medium text-green-700 underline"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      );
    }

    // Default form content for login/signup/forgotPassword
    return (
      <div className="w-full max-w-md">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              {currentView === "login" ? "Welcome back" :
                currentView === "signup" ? "Create an account" :
                  "Forgot Password"}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {currentView === "login"
                ? "Sign in to manage your treatments, bookings and follow-ups."
                : currentView === "signup"
                  ? "Create an account to save your plans and personalized programs."
                  : "Enter your email address to receive a password reset OTP."}
            </p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {currentView === "signup" && (
            <ThemeInput
              name="name"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <ThemeInput
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {(currentView === "login" || currentView === "signup") && (
            <ThemeInput
              name="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}

          {currentView === "signup" && (
            <ThemeInput
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}

          {error && <div className="text-sm text-red-500">{error}</div>}
          {info && <div className="text-sm text-green-600">{info}</div>}

          <div className="flex flex-col gap-3 mt-2">
            <AyurvedaButton
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading
                ? currentView === "login" ? "Signing in..." :
                  currentView === "signup" ? "Creating..." : "Sending..."
                : currentView === "login" ? "Sign in" :
                  currentView === "signup" ? "Create account" : "Send Reset OTP"}
            </AyurvedaButton>
          </div>

          {currentView === "login" && (
            <div className="text-center text-sm text-gray-600 mt-2">
              <button
                type="button"
                onClick={() => switchView("forgotPassword")}
                className="text-green-700 underline"
              >
                Forgot your password?
              </button>
            </div>
          )}

          <div className="text-center text-sm text-gray-600 mt-3">
            {currentView === "login" ? "Don't have an account?" :
              currentView === "signup" ? "Already have an account?" :
                "Remember your password?"}{" "}
            <button
              type="button"
              onClick={() => switchView(currentView === "login" ? "signup" : "login")}
              className="text-sm font-medium text-green-700 underline"
            >
              {currentView === "login" ? "Sign up" :
                currentView === "signup" ? "Log in" : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (currentView === "otp" || currentView === "gettingStarted") {
    return (
      <main className="min-h-screen bg-[#f6faf5] flex items-center justify-center p-6">
        {renderFormContent()}
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-[#f6faf5] text-gray-900"
      style={{ padding: 28 }}
    >
      <div
        className="w-full max-w-6xl rounded-2xl shadow-xl overflow-hidden bg-white"
        style={{ border: "1px solid #eef3ec" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* FORM PANEL */}
          <section
            ref={formRef}
            className="p-8 md:p-12 flex items-center"
            style={{
              minHeight: 560,
              background: "linear-gradient(180deg,#ffffff, #fbfdf8)",
            }}
          >
            {renderFormContent()}
          </section>

          {/* IMAGE PANEL */}
          <section
            ref={imageRef}
            className="relative p-6 md:p-8 flex flex-col justify-between"
            style={{
              minHeight: 560,
              backgroundImage: `linear-gradient(180deg, rgba(58,125,68,0.06), rgba(58,125,68,0.02)), url(${currentBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="flex justify-end"></div>

            <div className="flex-1 flex items-center justify-center mt-4">
              <div className="w-full max-w-md rounded-xl overflow-hidden bg-white/80 border border-gray-100 shadow">
                <img
                  src={currentBg}
                  alt="Promotional media"
                  className="w-full h-96 object-cover"
                />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Capturing Moments, Creating Memories
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                A calm, balanced aesthetic blended with Ayurveda-inspired greens.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}