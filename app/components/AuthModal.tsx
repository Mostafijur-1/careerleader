"use client";
import { useState } from "react";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";

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

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { setUser } = useUser();
  const { t } = useLanguage();
  const a = t.auth;
  const [mode, setMode] = useState<"login" | "register">("login");
  const [type, setType] = useState<"student" | "mentor" | "admin">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [expertise, setExpertise] = useState("");
  const [zoomLink, setZoomLink] = useState("");
  const [meetLink, setMeetLink] = useState("");
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
      zoomLink: type === "mentor" && mode === "register" ? zoomLink : undefined,
      meetLink: type === "mentor" && mode === "register" ? meetLink : undefined,
      role: type === "admin" && mode === "register" ? role : undefined,
    };
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMessage(data.message);
      setMessageType("success");
      
      if (mode === "login") {
        setUser(data.user);
        setTimeout(() => {
          onClose();
          setMessage("");
        }, 1500);
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
            setZoomLink("");
            setMeetLink("");
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
            setZoomLink("");
            setMeetLink("");
            setMessage("");
            setMessageType("");
          }, 1500);
        }
      }
    } else {
      setMessage(data.error || "Error");
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
          <div className={`flex gap-2 mb-5 ${type === "admin" ? "opacity-50 pointer-events-none" : ""}`}>
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
            {type !== "admin" && (
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
            )}
          </div>

          {/* Admin-only message */}
          {type === "admin" && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded mb-4 text-sm text-blue-800">
              <span className="font-semibold">{a.adminNote}</span> {a.adminNoteBody}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* User Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{a.userType}</label>
              <select
                value={type}
                onChange={e => {
                  const newType = e.target.value as "student" | "mentor" | "admin";
                  setType(newType);
                  if (newType === "admin") {
                    setMode("login");
                  }
                }}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                title="User Type"
              >
                <option value="student">{a.student}</option>
                <option value="mentor">{a.mentor}</option>
                <option value="admin">{a.admin}</option>
              </select>
            </div>

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
                {type === "mentor" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      {a.expertise} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={expertise}
                      onChange={e => setExpertise(e.target.value)}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                      placeholder="Python, Web Development"
                      required
                    />
                  </div>
                )}
                {type === "mentor" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">{a.zoomOptional}</label>
                      <input
                        type="url"
                        value={zoomLink}
                        onChange={e => setZoomLink(e.target.value)}
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                        placeholder="https://zoom.us/j/..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">{a.meetOptional}</label>
                      <input
                        type="url"
                        value={meetLink}
                        onChange={e => setMeetLink(e.target.value)}
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                        placeholder="https://meet.google.com/..."
                      />
                    </div>
                  </>
                )}
                {type === "admin" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{a.adminRole}</label>
                    <input
                      type="text"
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                      placeholder="System Admin"
                    />
                  </div>
                )}
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

          {/* Success Message (NOT mentor notice) */}
          {message && !showMentorNotice && (
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

          {/* Mentor Registration Notice - ONLY AFTER SUCCESSFUL MENTOR REGISTRATION */}
          {showMentorNotice && (
            <div className="mt-4 p-3 rounded-lg text-sm font-semibold text-yellow-800 border-l-4 border-yellow-500 bg-yellow-50">
              <div className="text-center">{a.mentorSuccess}</div>
              <div className="text-center mt-2">{a.mentorPending}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}