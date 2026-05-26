'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { ArrowLeft, ChevronDown, Menu, Bell, LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore } from '@/store/uiStore';

interface HeaderProps {
  breadcrumb?: string;
  showBack?: boolean;
  backHref?: string;
  mobileTitle?: string;
}

export default function Header({
  breadcrumb = 'Assignment',
  showBack = true,
  backHref,
  mobileTitle,
}: HeaderProps) {
  const router = useRouter();
  const { openDrawer } = useUIStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click
  function handleBodyClick(e: React.MouseEvent) {
    if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
  }

  return (
    <>
      {/* ── Desktop header ─────────────────────────────────────── */}
      <header
        className="hidden lg:flex items-center justify-between px-6 py-4 bg-[#f0f0f0] border-b border-[#e8e8e8] sticky top-0 z-30"
        onClick={handleBodyClick}
      >
        <div className="flex items-center gap-2 text-sm text-[#a9a9a9] font-inter">
          {showBack && (
            <button
              onClick={() => backHref ? router.push(backHref) : router.back()}
              className="hover:text-[#2f2f2f] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <Image src="/icons/assignment.png" alt="" width={14} height={14} className="opacity-50" />
          <span className="font-medium">{breadcrumb}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setNotifOpen((v) => !v); setProfileOpen(false); }}
              className="relative p-2 rounded-xl hover:bg-white transition-colors"
            >
              <Bell className="w-5 h-5 text-[#5d5d5d]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff5623] rounded-full" />
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-11 w-72 bg-white rounded-2xl border border-[#efefef] shadow-lg z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-[#f6f6f6] flex items-center justify-between">
                    <span className="text-sm font-bold text-[#2f2f2f]">Notifications</span>
                    <span className="text-xs text-[#a9a9a9]">Mark all read</span>
                  </div>
                  <div className="px-4 py-3 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#ff5623] mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm text-[#2f2f2f] font-medium">Assignment generated</p>
                      <p className="text-xs text-[#a9a9a9] mt-0.5">Your question paper is ready to download.</p>
                    </div>
                  </div>
                  <div className="px-4 py-3 text-center border-t border-[#f6f6f6]">
                    <span className="text-xs text-[#a9a9a9]">No more notifications</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setProfileOpen((v) => !v); setNotifOpen(false); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#e8e8e8] hover:bg-[#f6f6f6] transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-[#efefef] flex items-center justify-center text-xs font-bold text-[#2f2f2f]">
                J
              </div>
              <span className="text-sm font-medium text-[#2f2f2f]">John Doe</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#a9a9a9] transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-11 w-52 bg-white rounded-2xl border border-[#efefef] shadow-lg z-50 overflow-hidden py-1"
                >
                  <div className="px-4 py-3 border-b border-[#f6f6f6]">
                    <p className="text-sm font-bold text-[#2f2f2f]">John Doe</p>
                    <p className="text-xs text-[#a9a9a9] mt-0.5">Delhi Public School</p>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#2f2f2f] hover:bg-[#f6f6f6] transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#5d5d5d]" />
                    Settings
                  </Link>
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ── Mobile pill header ─────────────────────────────────── */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white rounded-2xl mx-3 mt-3 shadow-sm sticky top-3 z-30">
        <Link href="/">
          <Image src="/logo.png" alt="VedaAI" width={90} height={26} priority />
        </Link>
        <div className="flex items-center gap-2">
          {/* Mobile notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative p-1.5 rounded-xl hover:bg-[#f6f6f6] transition-colors"
            >
              <Bell className="w-5 h-5 text-[#5d5d5d]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff5623] rounded-full" />
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-11 w-64 bg-white rounded-2xl border border-[#efefef] shadow-lg z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-[#f6f6f6]">
                    <span className="text-sm font-bold text-[#2f2f2f]">Notifications</span>
                  </div>
                  <div className="px-4 py-3 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#ff5623] mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm text-[#2f2f2f] font-medium">Assignment generated</p>
                      <p className="text-xs text-[#a9a9a9] mt-0.5">Your question paper is ready.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-[#efefef] flex items-center justify-center text-xs font-bold text-[#2f2f2f]">
            J
          </div>

          {/* Hamburger → opens drawer */}
          <button
            onClick={openDrawer}
            className="p-1.5 rounded-xl hover:bg-[#f6f6f6] transition-colors"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5 text-[#2f2f2f]" />
          </button>
        </div>
      </header>

      {/* ── Mobile sub-header (page title + back) ─────────────── */}
      {mobileTitle && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="lg:hidden flex items-center px-4 py-3 mt-1 gap-2"
        >
          {showBack && (
            <button
              onClick={() => backHref ? router.push(backHref) : router.back()}
              className="p-1 -ml-1 shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-[#2f2f2f]" />
            </button>
          )}
          <span className={`flex-1 text-sm font-bold text-[#2f2f2f] truncate ${showBack ? 'text-center -ml-7' : ''}`}>
            {mobileTitle}
          </span>
        </motion.div>
      )}
    </>
  );
}
