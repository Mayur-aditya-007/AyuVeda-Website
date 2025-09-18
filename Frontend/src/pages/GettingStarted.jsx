import axios from "axios";
import { useState } from "react";

export default function GettingStarted({ email }) {
  const [form, setForm] = useState({
    name: "",
    gender: "",
    dob: "",
    heightCm: "",
    weightKg: "",
    activity: "",
    profilePic: "",
  });

  const handleSubmit = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5001/api/auth/updateprofile/${email}`,
        form
      );

      if (response.data.success) {
        alert("Profile updated successfully!");
        // redirect to dashboard or homepage
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  return (
    <div>
      {/* example inputs */}
      <input
        type="text"
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        type="date"
        value={form.dob}
        onChange={(e) => setForm({ ...form, dob: e.target.value })}
      />
      {/* gender dropdown */}
      <select
        value={form.gender}
        onChange={(e) => setForm({ ...form, gender: e.target.value })}
      >
        <option value="">Select gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>

      <button onClick={handleSubmit}>Finish</button>
    </div>
  );
}
