"use client";
import React, { createContext, useEffect, useState, ReactNode } from "react";
import type { CareerGoalInput, CvEducation, GeneratedCv } from "@/lib/cvTypes";
import type { JourneyState } from "@/lib/journey";

export interface User {
  email: string;
  type: string;
  name: string;
  mbti?: string;
  goal?: CareerGoalInput | null;
  journey?: JourneyState;
  cvDraft?: GeneratedCv | null;
  bio?: string;
  skills?: string[];
  education?: CvEducation[];
  zoomLink?: string;
  meetLink?: string;
  expertise?: string[];
  headline?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<User | null>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

async function readJsonSafely(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const res = await fetch("/api/auth?me=true", { method: "GET", cache: "no-store" });
      const data = await readJsonSafely(res);
      const nextUser = res.ok && data?.user ? (data.user as User) : null;
      setUser(nextUser);
      return nextUser;
    } catch {
      setUser(null);
      return null;
    }
  }

  useEffect(() => {
    async function restoreSession() {
      await refreshUser();
      setLoading(false);
    }
    void restoreSession();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
