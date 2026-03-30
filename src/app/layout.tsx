import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ScrapeChatAI - LLM-Powered Web Scraper You Chat With",
  description:
    "Tell it what you want to scrape in plain English. ScrapeChatAI writes Playwright scripts, runs them, validates output with Zod schemas, and returns clean structured data.",
  keywords: [
    "web scraping",
    "AI scraper",
    "Playwright",
    "data extraction",
    "no-code scraping",
    "structured data",
    "GPT-4o",
    "Zod validation",
    "scraping tool",
    "ScrapeChatAI",
  ],
  authors: [{ name: "ScrapeChatAI" }],
  openGraph: {
    title: "ScrapeChatAI - Scrape the Web by Chatting with AI",
    description:
      "Describe what you want to scrape in plain English. ScrapeChatAI generates Playwright scripts, executes them, and returns validated structured data.",
    url: "https://scrapechat.ai",
    siteName: "ScrapeChatAI",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScrapeChatAI - Scrape the Web by Chatting with AI",
    description:
      "Describe what you want to scrape in plain English. AI writes the script, runs it, and returns clean data.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#00ff88" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "ScrapeChatAI",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              description:
                "AI-powered web scraping tool. Describe what you want to scrape in plain English, and get validated structured data back.",
              offers: [
                {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  name: "Free",
                },
                {
                  "@type": "Offer",
                  price: "29",
                  priceCurrency: "USD",
                  name: "Pro",
                  billingIncrement: "P1M",
                },
              ],
            }),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
