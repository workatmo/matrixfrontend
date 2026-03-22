"use client";

import { createContext, useContext } from "react";
import type { AdminUserPayload } from "@/lib/api";

interface AuthContextType {
  user: AdminUserPayload | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });

export function AuthProvider({ user, children }: { user: AdminUserPayload | null; children: React.ReactNode }) {
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

export function useAdminAuth() {
  return useContext(AuthContext);
}
