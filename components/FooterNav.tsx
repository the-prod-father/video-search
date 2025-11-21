'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Video, Search, Database, BarChart3, Home } from 'lucide-react';

export default function FooterNav() {
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
    <nav className="flex items-center justify-center space-x-2" role="navigation" aria-label="Footer navigation">
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
  );
}
