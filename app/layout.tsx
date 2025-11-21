import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Video, Search, Database, BarChart3, Info, Shield, Zap, Menu, X } from "lucide-react";
import Image from "next/image";
import MobileNav from "@/components/MobileNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Verdict - Digital Evidence Intelligence",
  description: "AI-powered video evidence analysis for digital forensics and law enforcement",
  metadataBase: new URL('https://video-search-roan.vercel.app'),
  openGraph: {
    title: "Verdict - Digital Evidence Intelligence",
    description: "AI-powered video evidence analysis for digital forensics and law enforcement",
    url: "https://video-search-roan.vercel.app",
    siteName: "Verdict",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Verdict Digital Evidence Intelligence Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verdict - Digital Evidence Intelligence",
    description: "AI-powered video evidence analysis for digital forensics and law enforcement",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-[#FAF8F2]">
          {/* Navigation */}
          <nav className="border-b-2 border-[#E8E6E0] bg-[#FFFEF9]/95 backdrop-blur-md sticky top-0 z-50 shadow-md">
            <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                    <Image
                      src="/logo.png"
                      alt="Verdict Logo"
                      fill
                      className="object-contain group-hover:scale-110 transition-transform drop-shadow-sm rounded-xl"
                      priority
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg sm:text-xl text-[#2563EB] tracking-tight">VERDICT</span>
                    <span className="text-[10px] sm:text-xs text-[#64748B] -mt-0.5 sm:-mt-1 hidden xs:block">Digital Evidence Intelligence</span>
                  </div>
                </Link>
                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
                  <Link
                    href="/"
                    className="flex items-center space-x-2 text-sm font-medium text-[#475569] hover:text-[#2563EB] transition-colors border-b-2 border-transparent hover:border-[#2563EB] pb-1"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/indexes"
                    className="flex items-center space-x-2 text-sm font-medium text-[#475569] hover:text-[#2563EB] transition-colors"
                  >
                    <Database className="h-4 w-4" />
                    <span className="hidden xl:inline">Evidence Indexes</span>
                    <span className="xl:hidden">Indexes</span>
                  </Link>
                  <Link
                    href="/videos"
                    className="flex items-center space-x-2 text-sm font-medium text-[#475569] hover:text-[#2563EB] transition-colors"
                  >
                    <Video className="h-4 w-4" />
                    <span>Videos</span>
                  </Link>
                  <Link
                    href="/search"
                    className="flex items-center space-x-2 text-sm font-medium text-[#475569] hover:text-[#2563EB] transition-colors"
                  >
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </Link>
                  <Link
                    href="/insights"
                    className="flex items-center space-x-2 text-sm font-medium text-[#475569] hover:text-[#2563EB] transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Analytics</span>
                  </Link>
                </div>
                {/* Mobile Navigation */}
                <MobileNav />
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t-2 border-[#E8E6E0] mt-auto bg-[#FFFEF9]/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-[#64748B]">
                <p className="text-center sm:text-left">Powered by TwelveLabs AI • Digital Evidence Intelligence Platform</p>
                <p className="flex items-center space-x-1">
                  <Shield className="h-3 w-3 text-[#2563EB]" />
                  <span>Secure • Compliant • Trusted</span>
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
