import type { Metadata } from "next";
import AccountPortalLayoutClient from "./AccountPortalLayoutClient";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function AccountPortalLayout({ children }: { children: React.ReactNode }) {
  return <AccountPortalLayoutClient>{children}</AccountPortalLayoutClient>;
}
