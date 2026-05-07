import type { Metadata } from "next";
import AdminSectionLayoutClient from "./AdminSectionLayoutClient";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  return <AdminSectionLayoutClient>{children}</AdminSectionLayoutClient>;
}
