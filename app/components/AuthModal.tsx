"use client";
import { useState } from "react";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";

const typeIcons = {
  student: "👨‍🎓",
};

const typeColors = {
  student: "from-blue-500 to-blue-600",
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

async function readJsonSafely(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { setUser } = useUser();
  const { t } = useLanguage();
  const a = t.auth;
  const [mode, setMode] = useState<"login" | "register">("login");
  const [type] = useState<"student">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">();
  const [loading, setLoading] = useState(false);

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
        setUser(data?.user || null);
        setTimeout(() => {
          onClose();
          setMessage("");
        }, 1500);
      }
      if (mode === "register") {
        setTimeout(() => {
          setMode("login");
          setEmail("");
          setPassword("");
          setName("");
          setMessage("");
          setMessageType("");
        }, 1500);
      }
    } else {
      setMessage(data?.error || "Error");
      setMessageType("error");
      setTimeout(() => setMessage(""), 4000);
    }
  }

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col relative my-4 sm:my-8" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl z-10"
        >
          ✕
        </button>

        {/* Header - Fixed */}
        <div className={`bg-gradient-to-r ${typeColors[type]} px-4 sm:px-6 py-4 sm:py-5 text-white text-center flex-shrink-0`}>
          <div className="text-4xl sm:text-5xl mb-1 sm:mb-2">{typeIcons[type]}</div>
          <h2 className="text-xl sm:text-2xl font-bold capitalize">{mode === "login" ? a.welcomeBack : a.joinUs}</h2>
          <p className="text-white/80 text-sm mt-1">
            {mode === "login" ? a.signIn : a.createAccount}
          </p>
        </div>

        {/* Form Container - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-3 sm:py-4">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-5">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition ${
                mode === "login"
                  ? `bg-gradient-to-r ${typeColors[type]} text-white`
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {a.login}
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition ${
                mode === "register"
                  ? `bg-gradient-to-r ${typeColors[type]} text-white`
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {a.register}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Registration Fields */}
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{a.fullName}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </>
            )}

            {/* Email & Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{a.email}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{a.password}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm text-white transition transform hover:scale-105 mt-3 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : `bg-gradient-to-r ${typeColors[type]} hover:shadow-lg`
              }`}
            >
              {loading ? a.processing : mode === "login" ? a.signInBtn : a.createAccountBtn}
            </button>
          </form>

          {/* Success/Error Message */}
          {message && (
            <div
              className={`mt-3 p-2.5 rounded-lg text-sm font-semibold text-center transition ${
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
    </div>
  );
}