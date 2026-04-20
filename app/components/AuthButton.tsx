"use client";
import { useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";

interface AuthButtonProps {
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function AuthButton({ onOpenAuth, onLogout }: AuthButtonProps) {
  const { user } = useUser();
  const { t } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show login button during SSR/hydration to prevent mismatch
  const displayUser = isMounted ? user : null;

  return displayUser ? (
    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
      <span className="text-xs sm:text-sm font-semibold text-gray-700 truncate max-w-[100px] sm:max-w-[140px]" title={displayUser.name || displayUser.email}>{displayUser.name || displayUser.email}</span>
      <button
        onClick={onLogout}
        className="text-red-600 font-semibold hover:text-red-700 transition"
      >
        {t.auth.logout}
      </button>
    </div>
  ) : (
    <button
      onClick={onOpenAuth}
      className="text-blue-600 font-semibold hover:text-blue-700 transition"
    >
      {t.auth.loginRegister}
    </button>
  );
}

