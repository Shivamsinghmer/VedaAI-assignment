'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';

const NAV = [
  { label: 'Home', href: '/', icon: '/icons/home.png' },
  { label: 'My Groups', href: '/groups', icon: '/icons/my-group.png' },
  { label: 'Assignments', href: '/assignments', icon: '/icons/assignment.png' },
  { label: "AI Teacher's Toolkit", href: '/toolkit', icon: '/icons/ai-teacher-toolkit.png' },
  { label: 'My Library', href: '/library', icon: '/icons/llbrary.png' },
];

export default function MobileDrawer() {
  const { drawerOpen, closeDrawer } = useUIStore();
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
            onClick={closeDrawer}
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-white z-[70] flex flex-col py-6 px-4 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 px-2">
              <Image src="/logo.png" alt="VedaAI" width={100} height={28} priority />
              <button
                onClick={closeDrawer}
                className="p-2 rounded-xl hover:bg-[#f6f6f6] transition-colors"
              >
                <X className="w-5 h-5 text-[#5d5d5d]" />
              </button>
            </div>

            {/* Create CTA */}
            <Link
              href="/assignments/create"
              onClick={closeDrawer}
              className="flex items-center justify-center gap-2 bg-[#171717] text-white text-sm font-semibold px-4 py-2.5 rounded-full mb-6 hover:bg-[#2f2f2f] transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Create Assignment
            </Link>

            {/* Nav items */}
            <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
              {NAV.map(({ label, href, icon }) => {
                const active =
                  href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(href);
                return (
                  <Link
                    key={`${label}-${href}`}
                    href={href}
                    onClick={closeDrawer}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors relative',
                      active
                        ? 'text-[#2f2f2f] font-semibold'
                        : 'text-[#5d5d5d] hover:text-[#2f2f2f] hover:bg-[#f6f6f6]'
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#4bc16c] rounded-r-full" />
                    )}
                    <Image
                      src={icon}
                      alt={label}
                      width={18}
                      height={18}
                      className={cn('shrink-0', !active && 'opacity-50')}
                    />
                    <span className="flex-1 truncate">{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom — settings + profile */}
            <div className="mt-4 pt-4 border-t border-[#efefef]">
              <Link
                href="/settings"
                onClick={closeDrawer}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors mb-3',
                  pathname === '/settings'
                    ? 'text-[#2f2f2f] font-semibold'
                    : 'text-[#5d5d5d] hover:text-[#2f2f2f] hover:bg-[#f6f6f6]'
                )}
              >
                <Settings className="w-4 h-4 opacity-60" />
                Settings
              </Link>

              <div className="px-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#efefef] flex items-center justify-center text-[#2f2f2f] font-bold text-sm shrink-0">
                  J
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#2f2f2f] truncate">John Doe</p>
                  <p className="text-[11px] text-[#a9a9a9] truncate">Delhi Public School</p>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
