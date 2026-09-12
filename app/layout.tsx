import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { getSiteURL } from "@/lib/site-url";
import { Providers } from "@/app/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const title = "PITCON — Where African ambition becomes funded and structured";
const description =
  "PITCON connects African founders with investors ready to back structured, credible startups.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteURL()),
  title: {
    default: title,
    template: "%s | PITCON",
  },
  description,
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "PITCON",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
