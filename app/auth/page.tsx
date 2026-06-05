"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";

const typeIcons = {
  student: "👨‍🎓",
};

const typeColors = {
  student: "from-blue-500 to-indigo-600",
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
  const { user: globalUser, setUser: setGlobalUser } = useUser();
  const { t } = useLanguage();
  const a = t.auth;
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [type] = useState<"student">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ email: string; type: string; name: string } | null>(null);

  // Sync state with global user context
  useEffect(() => {
    if (globalUser) {
      setUser(globalUser);
    } else {
      setUser(null);
    }
  }, [globalUser]);

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
        const loggedInUser = data?.user || null;
        setUser(loggedInUser);
        setGlobalUser(loggedInUser);
        const role = loggedInUser?.type;
        setTimeout(() => {
          if (role === "mentor") {
            router.push("/mentor");
          } else if (role === "admin") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        }, 1500);
      }
      if (mode === "register") {
        setTimeout(() => setMode("login"), 1500);
        setEmail("");
        setPassword("");
        setName("");
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
        setGlobalUser(null);
        setMessage("Logged out successfully!");
        setMessageType("success");
        setTimeout(() => setMessage(""), 3000);
      });
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 py-8 sm:py-12 overflow-hidden select-none">
      {/* Dynamic glow highlights */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl"></div>

      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-md min-w-0 z-10">
        {user ? (
          /* Logged In View */
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 shadow-2xl rounded-3xl p-6 sm:p-8 text-center space-y-6">
            <div className="space-y-2">
              <div className="relative inline-flex items-center justify-center mb-2">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg scale-125"></div>
                <div className="relative w-20 h-20 bg-slate-800/80 border border-slate-700/60 text-4xl rounded-2xl flex items-center justify-center shadow-lg">
                  {typeIcons[user.type as keyof typeof typeIcons] || "👤"}
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                Welcome Back!
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm font-medium">
                You're logged in as a{" "}
                <span className="text-indigo-400 font-bold capitalize">
                  {user.type}
                </span>
              </p>
            </div>

            <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 text-left space-y-3 font-semibold text-xs text-slate-400">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Email Address</p>
                <p className="text-sm font-extrabold text-slate-200">{user.email}</p>
              </div>
              {user.name && (
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Full Name</p>
                  <p className="text-sm font-extrabold text-slate-200">{user.name}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-red-500/10 hover:shadow-red-500/25 active:scale-98 transition transform cursor-pointer"
            >
              🚪 Logout
            </button>
          </div>
        ) : (
          /* Login/Register Form View */
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 shadow-2xl rounded-3xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-slate-900/60 border-b border-slate-800/60 px-6 py-6 sm:py-8 text-center relative">
              <div className="relative inline-flex items-center justify-center mb-3">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-lg scale-125"></div>
                <div className="relative w-16 h-16 bg-slate-800/80 border border-slate-700/60 text-3xl rounded-2xl flex items-center justify-center shadow-lg">
                  {typeIcons[type]}
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                {mode === "login" ? a.welcomeBack : a.joinUs}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5 font-medium">
                {mode === "login" ? a.signIn : a.createAccount}
              </p>
            </div>

            {/* Form Fields */}
            <div className="px-6 py-6 sm:px-8 sm:py-8 space-y-6">
              {/* Tab Selector */}
              <div className="flex bg-slate-950/60 p-1 rounded-2xl border border-slate-800/60 gap-1">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`flex-grow py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                    mode === "login"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                  }`}
                >
                  {a.login}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`flex-grow py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                    mode === "register"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                  }`}
                >
                  {a.register}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Registration Fields */}
                {mode === "register" && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">{a.fullName}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 shadow-inner"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">{a.email}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 shadow-inner"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">{a.password}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 shadow-inner"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-98 transition transform cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  )}
                  <span>{loading ? a.processing : mode === "login" ? a.signInBtn : a.createAccountBtn}</span>
                </button>
              </form>

              {/* Success/Error Alert Messages */}
              {message && (
                <div
                  className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 border transition duration-200 ${
                    messageType === "success"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}
                >
                  <span className="text-base shrink-0">{messageType === "success" ? "✅" : "❌"}</span>
                  <span className="leading-snug">{message}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
