import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

import { AppProviders } from "@/components/layout/app-providers";
import { themePreHydrationScript } from "@/components/layout/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Digital Store — Instant gift cards, gaming credits & subscriptions",
  description:
    "Buy PUBG UC, Free Fire Diamonds, Netflix, Spotify and more. Pay via eSewa or Khalti, delivered in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themePreHydrationScript }}
        />
      </head>
      <body className="min-h-full bg-[color:var(--color-canvas)] text-[color:var(--color-text)]">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
