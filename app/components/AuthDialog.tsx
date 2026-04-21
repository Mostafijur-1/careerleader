"use client";
import { useState } from "react";
import { useUser } from "../contexts/UserContext";

const typeIcons = {
  student: "👨‍🎓",
  mentor: "👨‍🏫",
  admin: "👨‍💼",
};

const typeColors = {
  student: "from-blue-500 to-blue-600",
  mentor: "from-purple-500 to-purple-600",
  admin: "from-orange-500 to-orange-600",
};

async function readJsonSafely(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function AuthDialog() {
  const { user, setUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [type, setType] = useState<"student" | "mentor" | "admin">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [expertise, setExpertise] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">();
  const [loading, setLoading] = useState(false);
  const [showMentorNotice, setShowMentorNotice] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    setShowMentorNotice(false);

    const payload = {
      action: mode,
      type,
      email,
      password,
      name: mode === "register" ? name : undefined,
      expertise: type === "mentor" && mode === "register" ? expertise.split(",").map(e => e.trim()) : undefined,
      role: type === "admin" && mode === "register" ? role : undefined,
    };
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await readJsonSafely(res);
    setLoading(false);
    if (res.ok) {
      setMessage(data?.message || "Success");
      setMessageType("success");

      if (mode === "login") {
        setUser(data?.user || null);
        setTimeout(() => setIsOpen(false), 1500);
      }
      if (mode === "register") {
        if (type === "mentor") {
          setShowMentorNotice(true);
          setTimeout(() => {
            setMode("login");
            setEmail("");
            setPassword("");
            setName("");
            setExpertise("");
            setRole("");
            setMessage("");
            setMessageType("");
            setShowMentorNotice(false);
          }, 4000);
        } else {
          setTimeout(() => {
            setMode("login");
            setEmail("");
            setPassword("");
            setName("");
            setExpertise("");
            setRole("");
          }, 1500);
        }
      }
    } else {
      setMessage(data?.error || "Error");
      setMessageType("error");
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch {
      // Clear local user state even when API call fails.
    } finally {
      setUser(null);
      setMessage("Logged out successfully!");
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    }
  }

  return (
    <>
      {user ? (
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">{user.name || user.email}</span>
          <button
            onClick={handleLogout}
            className="text-red-600 font-semibold hover:text-red-700 transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="text-blue-600 font-semibold hover:text-blue-700 transition"
        >
          Login / Register
        </button>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-2 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] flex flex-col relative" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl z-10"
            >
              ✕
            </button>

            {/* Header - Fixed, doesn't scroll */}
            <div className={`bg-gradient-to-r ${typeColors[type]} px-6 py-4 text-white text-center flex-shrink-0`}>
              <div className="text-4xl mb-1">{typeIcons[type]}</div>
              <h2 className="text-xl font-bold capitalize">{mode === "login" ? "Welcome Back" : "Join Us"}</h2>
              <p className="text-white/80 text-xs mt-0.5">
                {mode === "login" ? "Sign in to your account" : "Create a new account"}
              </p>
            </div>

            {/* Form Container - Scrollable ONLY inside this div */}
            <div className="flex-1 overflow-y-auto min-h-0 px-5 py-3">
              {/* Mode Toggle */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-semibold text-xs transition ${
                    mode === "login"
                      ? `bg-gradient-to-r ${typeColors[type]} text-white`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-semibold text-xs transition ${
                    mode === "register"
                      ? `bg-gradient-to-r ${typeColors[type]} text-white`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-2">
                {/* User Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-0.5">User Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as "student" | "mentor" | "admin")}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                    title="User Type"
                  >
                    <option value="student">👨‍🎓 Student</option>
                    <option value="mentor">👨‍🏫 Mentor</option>
                    <option value="admin">👨‍💼 Admin</option>
                  </select>
                </div>

                {/* Registration Fields */}
                {mode === "register" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    {type === "mentor" && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-0.5">
                          Expertise <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={expertise}
                          onChange={e => setExpertise(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                          placeholder="Python, Web Dev"
                          required
                        />
                      </div>
                    )}
                    {type === "admin" && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-0.5">Admin Role</label>
                        <input
                          type="text"
                          value={role}
                          onChange={e => setRole(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                          placeholder="System Admin"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Email & Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-0.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-0.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-1.5 px-4 rounded-lg font-bold text-xs text-white transition transform hover:scale-105 mt-2 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : `bg-gradient-to-r ${typeColors[type]} hover:shadow-lg`
                  }`}
                >
                  {loading ? "Processing..." : mode === "login" ? "Sign In" : "Create Account"}
                </button>
              </form>

              {/* Success Message (NOT mentor notice) */}
              {message && !showMentorNotice && (
                <div
                  className={`mt-2 p-1.5 rounded-lg text-xs font-semibold text-center transition ${
                    messageType === "success"
                      ? "bg-green-100 text-green-800 border-l-4 border-green-500"
                      : "bg-red-100 text-red-800 border-l-4 border-red-500"
                  }`}
                >
                  {messageType === "success" && "✅ "}{messageType === "error" && "❌ "}{message}
                </div>
              )}

              {/* Mentor Registration Notice - ONLY AFTER SUCCESSFUL MENTOR REGISTRATION */}
              {showMentorNotice && (
                <div className="mt-3 p-2 rounded-lg text-xs font-semibold text-yellow-800 border-l-4 border-yellow-500 bg-yellow-50">
                  <div className="text-center">✅ Account created successfully!</div>
                  <div className="text-center mt-1">⚠️ Your mentor account will be inactive until approved by an admin.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}