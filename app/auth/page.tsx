"use client";
import { useState } from "react";
import LanguageToggle from "../components/LanguageToggle";

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

export default function AuthPage() {
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
  const [user, setUser] = useState<{ email: string; type: string; name: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);
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
      if (mode === "login") setUser(data?.user || null);
      if (mode === "register") {
        setTimeout(() => setMode("login"), 1500);
        setEmail("");
        setPassword("");
        setName("");
        setExpertise("");
        setRole("");
      }
    } else {
      setMessage(data?.error || "Error");
      setMessageType("error");
    }
  }

  function handleLogout() {
    fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    })
      .catch(() => undefined)
      .finally(() => {
        setUser(null);
        setMessage("Logged out successfully!");
        setMessageType("success");
        setTimeout(() => setMessage(""), 3000);
      });
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 py-8 sm:py-12">
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle />
      </div>
      <div className="w-full max-w-md min-w-0">
        {user ? (
          <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className={`text-5xl sm:text-6xl mb-3 sm:mb-4`}>{typeIcons[user.type as keyof typeof typeIcons]}</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
              <p className="text-gray-600">You're logged in as a</p>
              <p className={`text-lg font-bold mt-1 bg-gradient-to-r ${typeColors[user.type as keyof typeof typeColors]} bg-clip-text text-transparent capitalize`}>
                {user.type}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-900">{user.email}</p>
              {user.name && (
                <>
                  <p className="text-sm text-gray-600 mt-3">Name</p>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                </>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 rounded-lg transition transform hover:scale-105"
            >
              🚪 Logout
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className={`bg-gradient-to-r ${typeColors[type]} p-5 sm:p-8 text-white text-center`}>
              <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">{typeIcons[type]}</div>
              <h2 className="text-2xl sm:text-3xl font-bold capitalize">{mode === "login" ? "Welcome Back" : "Join Us"}</h2>
              <p className="text-white/80 mt-2">
                {mode === "login" ? "Sign in to your account" : "Create a new account"}
              </p>
            </div>

            {/* Form */}
            <div className="p-5 sm:p-8">
              {/* Mode Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
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
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                    mode === "register"
                      ? `bg-gradient-to-r ${typeColors[type]} text-white`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* User Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">User Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as "student" | "mentor" | "admin")}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
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
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    {type === "mentor" && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Expertise <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={expertise}
                          onChange={e => setExpertise(e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                          placeholder="Python, Web Development, Database Design"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
                      </div>
                    )}
                    {type === "admin" && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Role</label>
                        <input
                          type="text"
                          value={role}
                          onChange={e => setRole(e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                          placeholder="e.g, System Admin, Content Manager"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Email & Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {/* Mentor Active Status Info */}
                {mode === "register" && type === "mentor" && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                    <p className="text-sm text-yellow-800">
                      <span className="font-semibold">⚠️ Note:</span> Your mentor account will be inactive until approved by an admin.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg font-bold text-white transition transform hover:scale-105 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : `bg-gradient-to-r ${typeColors[type]} hover:shadow-lg`
                  }`}
                >
                  {loading ? "Processing..." : mode === "login" ? "Sign In" : "Create Account"}
                </button>
              </form>

              {/* Message */}
              {message && (
                <div
                  className={`mt-4 p-3 rounded-lg text-sm font-semibold text-center transition ${
                    messageType === "success"
                      ? "bg-green-100 text-green-800 border-l-4 border-green-500"
                      : "bg-red-100 text-red-800 border-l-4 border-red-500"
                  }`}
                >
                  {messageType === "success" && "✅ "}{messageType === "error" && "❌ "}{message}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
