"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "../contexts/UserContext";
import LanguageToggle from "../components/LanguageToggle";

async function readJsonSafely(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function StaffLoginPage() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [type, setType] = useState<"mentor" | "admin">("mentor");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    if (!user) return;
    if (user.type === "mentor") router.replace("/mentor");
    if (user.type === "admin") router.replace("/admin");
    if (user.type === "student") router.replace("/");
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: mode === "register" ? "register" : "login",
        type,
        name: mode === "register" ? name : undefined,
        email,
        password,
      }),
    });
    const data = await readJsonSafely(res);
    setLoading(false);

    if (!res.ok) {
      setMessage(data?.error || (mode === "register" ? "Registration failed" : "Login failed"));
      setMessageType("error");
      return;
    }

    if (mode === "register") {
      setMessage("Mentor registration successful. You can now log in.");
      setMessageType("success");
      setMode("login");
      setPassword("");
      return;
    }

    setUser(data?.user || null);
    setMessage("Login successful");
    setMessageType("success");

    const role = data?.user?.type;
    if (role === "mentor") {
      router.replace("/mentor");
      return;
    }
    if (role === "admin") {
      router.replace("/admin");
      return;
    }

    router.replace("/");
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white text-center">
            <h1 className="text-2xl font-bold">Staff Login</h1>
            <p className="text-white/80 mt-2 text-sm">For mentor and admin access only</p>
          </div>

          <div className="p-6">
            <div className="flex gap-2 mb-5">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                  mode === "login"
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("mentor");
                  setMode("register");
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                  mode === "register"
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Register as Mentor
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  value={type}
                  onChange={e => {
                    const nextType = e.target.value as "mentor" | "admin";
                    setType(nextType);
                    if (nextType === "admin") {
                      setMode("login");
                    }
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  title="Staff role"
                  disabled={mode === "register"}
                >
                  <option value="mentor">Mentor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {mode === "register" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                    placeholder="Your full name"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  placeholder="staff@example.com"
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

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-bold text-white transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                }`}
              >
                {loading ? (mode === "register" ? "Registering..." : "Signing in...") : (mode === "register" ? "Create Mentor Account" : "Sign In")}
              </button>
            </form>

            {message && (
              <div
                className={`mt-4 p-3 rounded-lg text-sm font-semibold text-center ${
                  messageType === "success"
                    ? "bg-green-100 text-green-800 border-l-4 border-green-500"
                    : "bg-red-100 text-red-800 border-l-4 border-red-500"
                }`}
              >
                {message}
              </div>
            )}

            <div className="mt-4 text-center">
              <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
