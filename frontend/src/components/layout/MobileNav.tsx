'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Home', href: '/', icon: '/icons/home.png', matchExact: true },
  { label: 'Create', href: '/assignments/create', icon: '/icons/assignment.png', matchExact: false },
  { label: 'Library', href: '/library', icon: '/icons/llbrary.png', matchExact: false },
  { label: 'AI Toolkit', href: '/toolkit', icon: '/icons/ai-teacher-toolkit.png', matchExact: false },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-4 left-3 right-3 z-50">
      <div className="bg-[#1a1a1a] rounded-2xl shadow-lg flex justify-around px-2 py-2.5">
        {tabs.map(({ label, href, icon, matchExact }) => {
          const active = matchExact
            ? pathname === href
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 relative"
            >
              <div className={cn(
                'w-8 h-8 flex items-center justify-center rounded-lg transition-all relative',
                active && 'bg-white/10'
              )}>
                <Image
                  src={icon}
                  alt={label}
                  width={20}
                  height={20}
                  className={cn('shrink-0', active ? 'brightness-0 invert' : 'brightness-0 invert opacity-50')}
                />
                {active && (
                  <motion.div
                    layoutId="mobile-nav-dot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </div>
              <span className={cn('text-[10px] font-medium', active ? 'text-white' : 'text-white/40')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
