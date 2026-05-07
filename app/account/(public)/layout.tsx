import type { Metadata } from "next";
import { AccountChrome } from "@/components/account/AccountChrome";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
};

export default function AccountPublicLayout({ children }: { children: React.ReactNode }) {
  return <AccountChrome>{children}</AccountChrome>;
}
