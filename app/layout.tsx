import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";

import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ToggleTheme } from "@/components/toggle-theme";
import {
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/base/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";

import "../styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "OnceHuman Support - 원스휴먼 계산기 & 도구",
    template: "%s | OnceHuman Support"
  },
  description: "원스휴먼(OnceHuman) 게임을 위한 종합 지원 도구입니다. 스위치 포인트 계산기, 캐릭터 관리, 재료 계산 등 다양한 기능을 제공합니다.",
  keywords: ["원스휴먼", "OnceHuman", "게임 도구", "계산기", "스위치 포인트", "캐릭터 관리", "재료 계산"],
  authors: [{ name: "OnceHuman Support Team" }],
  creator: "OnceHuman Support",
  publisher: "OnceHuman Support",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    title: "OnceHuman Support - 원스휴먼 계산기 & 도구",
    description: "원스휴먼(OnceHuman) 게임을 위한 종합 지원 도구입니다. 스위치 포인트 계산기, 캐릭터 관리, 재료 계산 등 다양한 기능을 제공합니다.",
    siteName: "OnceHuman Support",
  },
  twitter: {
    card: "summary_large_image",
    title: "OnceHuman Support - 원스휴먼 계산기 & 도구",
    description: "원스휴먼(OnceHuman) 게임을 위한 종합 지원 도구입니다.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning>
      <head>
        <GoogleAnalytics />
      </head>
      <body className={`${geistSans.variable}   ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <Toaster richColors />
          <SidebarProvider defaultOpen>
            <AppSidebar />
            <SidebarInset>
              <SidebarHeader>
                <div className=" flex items-center justify-between">
                  <SidebarTrigger></SidebarTrigger>
                  <ToggleTheme></ToggleTheme>
                </div>
              </SidebarHeader>
              <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className=" flex-1 rounded-xl ">{children}</div>
              </main>
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
