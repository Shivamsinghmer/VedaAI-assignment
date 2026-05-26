'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Settings, Sparkles } from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';

const nav = [
  { label: 'Home', href: '/', icon: '/icons/home.png' },
  { label: 'My Groups', href: '/groups', icon: '/icons/my-group.png' },
  { label: 'Assignments', href: '/assignments', icon: '/icons/assignment.png' },
  { label: "AI Teacher's Toolkit", href: '/toolkit', icon: '/icons/ai-teacher-toolkit.png' },
  { label: 'My Library', href: '/library', icon: '/icons/llbrary.png' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { assignments, fetchAssignments, isLoadingList, hasLoadedList } = useAssignmentStore();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current || isLoadingList) return;
    hasFetchedRef.current = true;
    fetchAssignments();
  }, [fetchAssignments, isLoadingList]);

  const assignmentCount = assignments.length;

  return (
    <aside className="hidden lg:flex flex-col w-[220px] min-h-screen bg-white border-r border-[#efefef] py-6 px-4 shrink-0 fixed top-0 left-0 z-40">
      {/* Logo */}
      <div className="px-2 mb-6">
        <Image src="/logo.png" alt="VedaAI" width={110} height={32} priority />
      </div>

      {/* Create Assignment CTA */}
      <Link
        href="/assignments/create"
        className="flex items-center justify-center gap-2 bg-[#171717] text-white text-sm font-semibold px-4 py-2.5 rounded-full mb-6 hover:bg-[#2f2f2f] transition-colors"
      >
        <Sparkles className="w-4 h-4" />
        Create Assignment
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {nav.map(({ label, href, icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          const badge = href === '/assignments' && hasLoadedList ? assignmentCount : undefined;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors relative',
                active ? 'text-[#2f2f2f] font-semibold' : 'text-[#5d5d5d] hover:text-[#2f2f2f] hover:bg-[#f6f6f6]'
              )}
            >
              {/* Active green dot */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#4bc16c] rounded-r-full" />
              )}
              <Image src={icon} alt={label} width={18} height={18} className={cn('shrink-0', !active && 'opacity-60')} />
              <span className="flex-1 truncate">{label}</span>
              {badge !== undefined && (
                <span className="bg-[#ff5623] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-tight">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="mt-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#5d5d5d] hover:text-[#2f2f2f] hover:bg-[#f6f6f6] transition-colors mb-3"
        >
          <Settings className="w-4 h-4 opacity-60" />
          Settings
        </Link>

        <div className="px-3 pt-3 border-t border-[#efefef]">
          <p className="text-xs font-semibold text-[#2f2f2f] truncate">Delhi Public School</p>
          <p className="text-[11px] text-[#a9a9a9] truncate">Bokaro Steel City</p>
          <div className="mt-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#efefef] flex items-center justify-center text-[#2f2f2f] font-bold text-sm overflow-hidden shrink-0">
              J
            </div>
            <span className="text-xs font-semibold text-[#2f2f2f] truncate">John Doe</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
