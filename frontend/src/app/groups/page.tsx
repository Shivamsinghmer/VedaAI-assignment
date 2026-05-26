'use client';

import { Users, Plus, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';
import Header from '@/components/layout/Header';
import { useUIStore } from '@/store/uiStore';

const SAMPLE_GROUPS = [
  { name: 'Grade 8 – Section A', students: 32, subject: 'Science' },
  { name: 'Grade 9 – Section B', students: 28, subject: 'Mathematics' },
  { name: 'Grade 7 – Section C', students: 35, subject: 'English' },
];

export default function GroupsPage() {
  const { toast } = useUIStore();

  return (
    <div className="flex flex-col min-h-screen">
      <Header breadcrumb="My Groups" showBack={false} mobileTitle="My Groups" />

      <div className="flex-1 p-4 lg:p-6">
        {/* Page title — desktop */}
        <div className="mb-5 hidden lg:block">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4bc16c] shrink-0" />
            <h1 className="text-xl font-bold text-[#2f2f2f]">My Groups</h1>
          </div>
          <p className="text-sm text-[#5d5d5d] mt-0.5 font-inter ml-[18px]">
            Manage your classes and student groups.
          </p>
        </div>

        {/* Coming soon banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-5 p-4 rounded-2xl bg-white border border-[#efefef] flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-[#f6f6f6] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#5d5d5d]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#2f2f2f]">Groups feature is in development</p>
            <p className="text-xs text-[#a9a9a9] mt-0.5 font-inter">Create class groups and assign papers to specific sections.</p>
          </div>
          <button
            onClick={() => toast("We'll notify you when Groups is ready!", 'info')}
            className="text-xs font-semibold text-[#2f2f2f] px-3 py-1.5 rounded-xl border border-[#e8e8e8] hover:bg-[#f6f6f6] active:scale-95 transition-all shrink-0"
          >
            Notify me
          </button>
        </motion.div>

        {/* Blurred preview cards */}
        <div className="relative">
          <div className="space-y-3 select-none pointer-events-none" aria-hidden>
            {SAMPLE_GROUPS.map((g, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 0.4, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
                className="bg-white rounded-2xl border border-[#efefef] p-4 flex items-center gap-4 blur-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-[#f6f6f6] flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-[#a9a9a9]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#2f2f2f] truncate">{g.name}</p>
                  <p className="text-xs text-[#a9a9a9] mt-0.5">{g.students} students · {g.subject}</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f0f0f0] text-[#5d5d5d] shrink-0">
                  View
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Create Group FAB (mobile) */}
        <button
          onClick={() => toast("Groups feature is coming soon! We'll notify you.", 'info')}
          className="lg:hidden fixed bottom-24 right-4 w-14 h-14 rounded-full bg-[#4bc16c] flex items-center justify-center shadow-lg active:scale-95 transition-all z-30"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>

        {/* Desktop CTA */}
        <button
          onClick={() => toast("Groups feature is coming soon! We'll notify you.", 'info')}
          className="hidden lg:flex fixed bottom-6 left-1/2 -translate-x-1/2 items-center gap-2 bg-[#171717] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg hover:bg-[#2f2f2f] transition-colors z-30 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Create Group
        </button>
      </div>
    </div>
  );
}
