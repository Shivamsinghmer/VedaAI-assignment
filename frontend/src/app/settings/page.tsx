'use client';

import { Bell, Shield, Palette, Globe, ChevronRight, User, School } from 'lucide-react';
import { motion } from 'motion/react';
import Header from '@/components/layout/Header';
import { useUIStore } from '@/store/uiStore';

const SECTIONS = [
  {
    title: 'Profile',
    items: [
      { icon: User, label: 'Personal Information', desc: 'Name, email, and contact details' },
      { icon: School, label: 'School Details', desc: 'Institution name, board, and location' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: Palette, label: 'Appearance', desc: 'Theme, font size, and display settings' },
      { icon: Globe, label: 'Language & Region', desc: 'Language, date format, and timezone' },
    ],
  },
  {
    title: 'Notifications',
    items: [
      { icon: Bell, label: 'Notification Settings', desc: 'Email and push notification preferences' },
    ],
  },
  {
    title: 'Security',
    items: [
      { icon: Shield, label: 'Privacy & Security', desc: 'Password, 2FA, and data management' },
    ],
  },
];

export default function SettingsPage() {
  const { toast } = useUIStore();

  return (
    <div className="flex flex-col min-h-screen">
      <Header breadcrumb="Settings" showBack={false} mobileTitle="Settings" />

      <div className="flex-1 p-4 lg:p-6 max-w-2xl mx-auto w-full">
        {/* Page title — desktop */}
        <div className="mb-5 hidden lg:block">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4bc16c] shrink-0" />
            <h1 className="text-xl font-bold text-[#2f2f2f]">Settings</h1>
          </div>
          <p className="text-sm text-[#5d5d5d] mt-0.5 font-inter ml-[18px]">
            Manage your account and app preferences.
          </p>
        </div>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-2xl border border-[#efefef] p-5 mb-4 flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-full bg-[#efefef] flex items-center justify-center text-xl font-bold text-[#2f2f2f] shrink-0">
            J
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#2f2f2f] text-sm">John Doe</p>
            <p className="text-xs text-[#a9a9a9] mt-0.5 truncate">john.doe@dps.edu.in</p>
            <p className="text-xs text-[#5d5d5d] mt-0.5">Delhi Public School, Bokaro</p>
          </div>
          <button
            onClick={() => toast('Profile editing coming soon!', 'info')}
            className="text-xs font-semibold text-[#2f2f2f] px-3 py-1.5 rounded-xl border border-[#e8e8e8] hover:bg-[#f6f6f6] active:scale-95 transition-all shrink-0"
          >
            Edit
          </button>
        </motion.div>

        {/* Settings sections */}
        {SECTIONS.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 * (si + 1) }}
            className="mb-4"
          >
            <p className="text-xs font-bold text-[#a9a9a9] uppercase tracking-wider mb-2 px-1">
              {section.title}
            </p>
            <div className="bg-white rounded-2xl border border-[#efefef] overflow-hidden divide-y divide-[#f6f6f6]">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => toast(`${item.label} — coming soon!`, 'info')}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#fafafa] active:bg-[#f6f6f6] transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#f6f6f6] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#5d5d5d]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#2f2f2f] leading-snug">{item.label}</p>
                      <p className="text-xs text-[#a9a9a9] mt-0.5 font-inter truncate">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#c0c0c0] shrink-0" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* App info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="text-center pt-2 pb-4"
        >
          <p className="text-xs text-[#a9a9a9] font-inter">VedaAI v1.0.0 · Built with Groq + Next.js</p>
        </motion.div>
      </div>
    </div>
  );
}
