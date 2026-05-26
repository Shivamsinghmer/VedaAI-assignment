'use client';

import { useState } from 'react';
import { BookOpen, FileText, Download, Search } from 'lucide-react';
import { motion } from 'motion/react';
import Header from '@/components/layout/Header';
import { useUIStore } from '@/store/uiStore';

const SAMPLE_ITEMS = [
  { title: 'Science – Chapter 3 Quiz', subject: 'Science', class: 'Grade 8', date: 'May 2025' },
  { title: 'Math Mid-Term Paper', subject: 'Mathematics', class: 'Grade 9', date: 'Apr 2025' },
  { title: 'English Grammar Test', subject: 'English', class: 'Grade 7', date: 'Mar 2025' },
];

export default function LibraryPage() {
  const { toast } = useUIStore();
  const [search, setSearch] = useState('');

  return (
    <div className="flex flex-col min-h-screen">
      <Header breadcrumb="Library" showBack={false} mobileTitle="My Library" />

      <div className="flex-1 p-4 lg:p-6">
        {/* Page title — desktop */}
        <div className="mb-5 hidden lg:block">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4bc16c] shrink-0" />
            <h1 className="text-xl font-bold text-[#2f2f2f]">My Library</h1>
          </div>
          <p className="text-sm text-[#5d5d5d] mt-0.5 font-inter ml-[18px]">
            Your saved question papers and templates.
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
            <BookOpen className="w-5 h-5 text-[#5d5d5d]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#2f2f2f]">Library is in development</p>
            <p className="text-xs text-[#a9a9a9] mt-0.5 font-inter">Generated papers will be auto-saved here for re-download.</p>
          </div>
          <button
            onClick={() => toast("We'll notify you when Library is ready!", 'info')}
            className="text-xs font-semibold text-[#2f2f2f] px-3 py-1.5 rounded-xl border border-[#e8e8e8] hover:bg-[#f6f6f6] active:scale-95 transition-all shrink-0"
          >
            Notify me
          </button>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative mb-5 max-w-sm"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a9a9a9]" />
          <input
            type="text"
            placeholder="Search library…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => toast('Library search will be available soon!', 'info')}
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-[#e8e8e8] text-sm text-[#2f2f2f] placeholder:text-[#a9a9a9] focus:outline-none focus:border-[#2f2f2f] transition-colors"
          />
        </motion.div>

        {/* Blurred sample list */}
        <div className="space-y-3 select-none pointer-events-none" aria-hidden>
          {SAMPLE_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 0.4, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 + 0.15 }}
              className="bg-white rounded-2xl border border-[#efefef] p-4 flex items-center gap-4 blur-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-[#f6f6f6] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-[#a9a9a9]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#2f2f2f] truncate">{item.title}</p>
                <p className="text-xs text-[#a9a9a9] mt-0.5">{item.subject} · {item.class} · {item.date}</p>
              </div>
              <Download className="w-4 h-4 text-[#a9a9a9] shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
