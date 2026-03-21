import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata = {
  title: "Matrix Super Admin",
  description: "Super Admin Dashboard for Matrix Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("dark antialiased", fontMono.variable, geist.variable)}
      suppressHydrationWarning
    >
      <body className="bg-black text-white font-sans">
        {children}
      </body>
    </html>
  );
}
