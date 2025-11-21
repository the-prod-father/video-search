'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Video, Search, Database, BarChart3, Home, FileText } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Videos', path: '/videos', icon: Video },
    { name: 'Indexes', path: '/indexes', icon: Database },
  ];

  return (
    <header className="bg-white border-b-4 border-tiffany-600 sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center space-x-3 group"
            aria-label="Go to Dashboard"
          >
            <div className="bg-gradient-to-r from-tiffany-500 to-tiffany-600 p-2 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
              <Video className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                TwelveLabs
              </h1>
              <p className="text-xs text-gray-600 font-semibold">Video Intelligence</p>
            </div>
          </button>

          {/* Navigation */}
          <nav className="flex items-center space-x-2" role="navigation" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`
                    flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium text-sm
                    transition-all duration-200
                    ${active
                      ? 'bg-[#1E3A8A] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                  aria-label={`Navigate to ${item.name}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{item.name}</span>
                </button>
              );
            })}

            {/* Highlighted Article Button */}
            <button
              onClick={() => router.push('/article')}
              className={`
                flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium text-sm
                transition-all duration-200 ml-2
                ${isActive('/article')
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                }
              `}
              aria-label="Read article on video AI training"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Training Data Reality</span>
              <span className="sm:hidden">Article</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
