'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, BarChart3, Database, Video, Search, Shield, FileText } from 'lucide-react';
import Link from 'next/link';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: BarChart3 },
    { name: 'Evidence Indexes', path: '/indexes', icon: Database },
    { name: 'Video Library', path: '/videos', icon: Video },
    { name: 'Search Evidence', path: '/search', icon: Search },
    { name: 'Analytics', path: '/insights', icon: Shield },
  ];

  const handleNavClick = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 rounded-lg text-[#475569] hover:bg-[#F8FAFC] transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-[73px] left-0 right-0 bg-[#FFFEF9] border-b-2 border-[#E8E6E0] shadow-xl z-50 lg:hidden">
            <nav className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item.path)}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                        ${
                          isActive
                            ? 'bg-[#2563EB] text-white'
                            : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#2563EB]'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}

                {/* Highlighted Article Link */}
                <div className="pt-2 mt-2 border-t border-gray-200">
                  <button
                    onClick={() => handleNavClick('/article')}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors w-full
                      ${
                        pathname === '/article'
                          ? 'bg-amber-500 text-white'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }
                    `}
                  >
                    <FileText className="h-5 w-5" />
                    <span>Training Data Reality</span>
                    <span className="ml-auto text-[10px] uppercase tracking-wide opacity-70">Must Read</span>
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}

