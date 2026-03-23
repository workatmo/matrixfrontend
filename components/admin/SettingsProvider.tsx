"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getAdminSettings, AdminSettings } from "@/lib/api";

interface SettingsContextType {
  settings: AdminSettings | null;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({ settings: null, loading: true });

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We only fetch on mount.
    getAdminSettings()
      .then(setSettings)
      .catch(() => {
        // Silently catch in case user is not logged in or backend fails.
        // It's covered by Layout's existing check or API handles redirects.
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
