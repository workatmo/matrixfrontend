import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { publicAppUrl } from "@/lib/config";
import { fetchPublicContactSettings } from "@/lib/fetch-public-contact";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteChrome } from "@/components/SiteChrome";
import { seoKeywords } from "@/lib/seo";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(publicAppUrl),
  title: {
    default: "Buy Car Tyres Online | Mobile Tyre Fitting Near You | matrix Tyres",
    template: "%s | matrix Tyres",
  },
  description:
    "Find the best tyres for your car using your registration number. Book mobile tyre fitting with fast service and best prices.",
  keywords: seoKeywords,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Buy Car Tyres Online | Mobile Tyre Fitting Near You | matrix Tyres",
    description:
      "Find the best tyres for your car using your registration number. Book mobile tyre fitting with fast service and best prices.",
    url: "/",
    type: "website",
    siteName: "matrix Tyres",
    images: [
      {
        url: "/tyre-placeholder.svg",
        width: 1200,
        height: 630,
        alt: "matrix Tyres mobile tyre fitting service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buy Car Tyres Online | Mobile Tyre Fitting Near You | matrix Tyres",
    description:
      "Find the best tyres for your car using your registration number. Book mobile tyre fitting with fast service and best prices.",
    images: ["/tyre-placeholder.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  verification: {
    google: "Q6iQIthxDGnrCJPxIrtYE6j85K7RsmBKUyMJV_BD9WQ",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const contact = await fetchPublicContactSettings();
  const base = publicAppUrl.replace(/\/$/, "");
  const fallbackLogo = `${base}/brand-logo.svg`;
  const brandLabel = contact.brand_name.trim() || "matrix Tyres";
  const brandLogo = contact.logo_url ?? fallbackLogo;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${base}#organization`,
    name: brandLabel,
    url: publicAppUrl,
    logo: brandLogo,
    sameAs: [],
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${base}#localbusiness`,
    name: brandLabel,
    image: brandLogo,
    url: publicAppUrl,
    telephone: "+44 7721 570075",
    areaServed: ["London", "Manchester", "Birmingham", "Leeds", "Coventry"],
    priceRange: "GBP",
    serviceType: "Mobile tyre fitting",
    parentOrganization: { "@id": `${base}#organization` },
  };

  return (
    <html
      lang="en"
      className={cn("antialiased", fontMono.variable, geist.variable)}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SiteChrome>{children}</SiteChrome>
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}

