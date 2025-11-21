'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Video, Search, Database, BarChart3, Home } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Videos', path: '/videos', icon: Video },
    { name: 'Indexes', path: '/indexes', icon: Database },
    { name: 'Insights', path: '/insights', icon: BarChart3 },
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
                    flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-base
                    transition-all duration-300 hover-lift shadow-md
                    ${active
                      ? 'bg-tiffany-800 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                  aria-label={`Navigate to ${item.name}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
