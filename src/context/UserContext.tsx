"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { BaziResult, BirthInfo } from "@/lib/types";

interface UserContextType {
  userId: string | null;
  archiveId: string | null;
  currentBazi: BaziResult | null;
  currentBirthInfo: BirthInfo | null;
  setUser: (id: string) => void;
  setArchive: (id: string, bazi: BaziResult, birthInfo: BirthInfo) => void;
  clearSession: () => void;
}

const UserContext = createContext<UserContextType>({
  userId: null,
  archiveId: null,
  currentBazi: null,
  currentBirthInfo: null,
  setUser: () => {},
  setArchive: () => {},
  clearSession: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [currentBazi, setCurrentBazi] = useState<BaziResult | null>(null);
  const [currentBirthInfo, setCurrentBirthInfo] = useState<BirthInfo | null>(null);

  // 从 localStorage 恢复
  useEffect(() => {
    const stored = localStorage.getItem("ai_fate_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserId(parsed.userId);
        setArchiveId(parsed.archiveId);
        setCurrentBazi(parsed.currentBazi);
        setCurrentBirthInfo(parsed.currentBirthInfo);
      } catch {}
    }
  }, []);

  // 持久化到 localStorage
  useEffect(() => {
    if (userId) {
      localStorage.setItem(
        "ai_fate_user",
        JSON.stringify({ userId, archiveId, currentBazi, currentBirthInfo })
      );
    }
  }, [userId, archiveId, currentBazi, currentBirthInfo]);

  const setUser = useCallback((id: string) => setUserId(id), []);

  const setArchive = useCallback(
    (id: string, bazi: BaziResult, birthInfo: BirthInfo) => {
      setArchiveId(id);
      setCurrentBazi(bazi);
      setCurrentBirthInfo(birthInfo);
    },
    []
  );

  const clearSession = useCallback(() => {
    setUserId(null);
    setArchiveId(null);
    setCurrentBazi(null);
    setCurrentBirthInfo(null);
    localStorage.removeItem("ai_fate_user");
  }, []);

  return (
    <UserContext.Provider
      value={{ userId, archiveId, currentBazi, currentBirthInfo, setUser, setArchive, clearSession }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);