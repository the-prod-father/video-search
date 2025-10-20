import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Video, Search, Database, BarChart3, Info } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TwelveLabs Video Search - Law Enforcement Demo",
  description: "Comprehensive demo of TwelveLabs video understanding for government and law enforcement applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {/* Navigation */}
          <nav className="border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                  <Video className="h-6 w-6" />
                  <span className="font-bold text-xl">TwelveLabs LE Demo</span>
                </Link>
                <div className="flex items-center space-x-6">
                  <Link
                    href="/"
                    className="flex items-center space-x-1 text-sm hover:text-primary transition-colors"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/indexes"
                    className="flex items-center space-x-1 text-sm hover:text-primary transition-colors"
                  >
                    <Database className="h-4 w-4" />
                    <span>Indexes</span>
                  </Link>
                  <Link
                    href="/videos"
                    className="flex items-center space-x-1 text-sm hover:text-primary transition-colors"
                  >
                    <Video className="h-4 w-4" />
                    <span>Videos</span>
                  </Link>
                  <Link
                    href="/search"
                    className="flex items-center space-x-1 text-sm hover:text-primary transition-colors"
                  >
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </Link>
                  <Link
                    href="/insights"
                    className="flex items-center space-x-1 text-sm hover:text-primary transition-colors"
                  >
                    <Info className="h-4 w-4" />
                    <span>Insights</span>
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t mt-auto">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <p>Built for TwelveLabs PM Interview - Government + Secure Deployment</p>
                <p>Demonstrating real-world law enforcement video analysis capabilities</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
