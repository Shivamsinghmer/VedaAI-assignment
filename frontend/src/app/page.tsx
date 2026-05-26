'use client';

import { useEffect, useRef } from 'react';
import {
  FileText,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { useAssignmentStore } from '@/store/assignmentStore';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  completed: 'Completed',
  processing: 'Generating…',
  pending: 'Pending',
  failed: 'Failed',
};

const QUICK_ACTIONS = [
  {
    label: 'Create Assignment',
    href: '/assignments/create',
    icon: Sparkles,
    primary: true,
    iconBg: 'bg-white/15',
    iconColor: 'text-white',
  },
  {
    label: 'All Assignments',
    href: '/assignments',
    icon: FileText,
    primary: false,
    iconBg: 'bg-[#f0f0f0]',
    iconColor: 'text-[#5d5d5d]',
  },
  {
    label: 'AI Toolkit',
    href: '/toolkit',
    icon: Zap,
    primary: false,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
  },
  {
    label: 'My Library',
    href: '/library',
    icon: BookOpen,
    primary: false,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
];

export default function HomePage() {
  const { assignments, fetchAssignments, isLoadingList, hasLoadedList } =
    useAssignmentStore();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current || isLoadingList || hasLoadedList) return;
    hasFetchedRef.current = true;
    fetchAssignments();
  }, [fetchAssignments, isLoadingList, hasLoadedList]);

  const total = assignments.length;
  const completed = assignments.filter((a) => a.status === 'completed').length;
  const inProgress = assignments.filter(
    (a) => a.status === 'processing' || a.status === 'pending'
  ).length;
  const aiGenerated = assignments.filter((a) => a.generatedPaper).length;

  const recent = [...assignments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const stats = [
    { label: 'Total', value: total, icon: FileText, bg: 'bg-[#f6f6f6]', iconColor: 'text-[#2f2f2f]' },
    { label: 'Completed', value: completed, icon: CheckCircle2, bg: 'bg-green-50', iconColor: 'text-green-600' },
    { label: 'In Progress', value: inProgress, icon: Clock, bg: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'AI Generated', value: aiGenerated, icon: Zap, bg: 'bg-purple-50', iconColor: 'text-purple-500' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header breadcrumb="Home" showBack={false} />

      <div className="flex-1 p-4 lg:p-6">

        {/* ── Desktop page title (green-dot style, consistent with other pages) ── */}
        <div className="mb-5 hidden lg:block">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4bc16c] shrink-0" />
            <h1 className="text-xl font-bold text-[#2f2f2f]">
              {getGreeting()}, John 👋
            </h1>
          </div>
          <p className="text-sm text-[#5d5d5d] mt-0.5 font-inter ml-[18px]">
            {formatDate()}
          </p>
        </div>

        {/* ── Mobile greeting (acts as page heading on mobile) ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-5 lg:hidden"
        >
          <h1 className="text-[22px] font-bold text-[#2f2f2f] leading-tight">
            {getGreeting()},<br />John 👋
          </h1>
          <p className="text-xs text-[#a9a9a9] mt-1 font-inter">{formatDate()}</p>
        </motion.div>

        {/* ── Hero CTA banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-5 rounded-2xl bg-[#171717] text-white p-5 flex items-center gap-4"
        >
          {/* Icon accent */}
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">Ready to create?</p>
            <p className="text-xs text-white/60 mt-0.5 font-inter leading-relaxed">
              Generate an AI question paper in seconds.
            </p>
          </div>
          <Link
            href="/assignments/create"
            className="flex items-center gap-1.5 bg-white text-[#171717] text-xs font-bold px-4 py-2.5 rounded-full shrink-0 hover:bg-white/90 active:scale-95 transition-all"
          >
            Create
          </Link>
        </motion.div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 + i * 0.06 }}
                className="bg-white rounded-2xl border border-[#efefef] p-4 flex flex-col gap-2.5"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2f2f2f] leading-none">
                    {isLoadingList ? (
                      <span className="inline-block w-7 h-5 bg-[#f0f0f0] rounded animate-pulse align-middle" />
                    ) : (
                      stat.value
                    )}
                  </p>
                  <p className="text-[11px] text-[#a9a9a9] mt-1.5 font-inter">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Quick Actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.33 }}
          className="mb-5"
        >
          <p className="text-xs font-bold text-[#a9a9a9] uppercase tracking-wider mb-3">
            Quick Actions
          </p>

          {/* Mobile: 2×2 app-icon grid — all 4 visible, no scroll needed */}
          <div className="grid grid-cols-2 gap-2 lg:hidden">
            {QUICK_ACTIONS.map(({ label, href, icon: Icon, primary, iconBg, iconColor }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: 0.35 + i * 0.05 }}
              >
                <Link
                  href={href}
                  className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl text-center active:scale-95 transition-all ${
                    primary
                      ? 'bg-[#171717] text-white'
                      : 'bg-white border border-[#efefef] text-[#2f2f2f]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <span className={`text-xs font-semibold leading-tight ${primary ? 'text-white' : 'text-[#2f2f2f]'}`}>
                    {label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Desktop: horizontal pill row */}
          <div className="hidden lg:flex gap-2 flex-wrap">
            {QUICK_ACTIONS.map(({ label, href, icon: Icon, primary }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 transition-colors ${
                  primary
                    ? 'bg-[#171717] text-white hover:bg-[#2f2f2f]'
                    : 'bg-white border border-[#efefef] text-[#2f2f2f] hover:bg-[#f6f6f6]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ── Recent Assignments ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.42 }}
          className="mb-5"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-[#a9a9a9] uppercase tracking-wider">
              Recent Assignments
            </p>
            <Link
              href="/assignments"
              className="text-xs font-semibold text-[#4bc16c] flex items-center gap-0.5"
            >
              See all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoadingList ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-[#efefef] h-[70px] animate-pulse"
                />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#efefef] p-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-[#f6f6f6] flex items-center justify-center mx-auto mb-3">
                <FileText className="w-5 h-5 text-[#a9a9a9]" />
              </div>
              <p className="text-sm font-semibold text-[#2f2f2f]">No assignments yet</p>
              <p className="text-xs text-[#a9a9a9] mt-0.5 font-inter">
                Create your first AI-powered question paper
              </p>
              <Link
                href="/assignments/create"
                className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-white bg-[#171717] px-4 py-2 rounded-full active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Get started
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recent.map((a, i) => (
                <motion.div
                  key={a._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.44 + i * 0.07 }}
                >
                  <Link
                    href={`/assignments/${a._id}`}
                    className="bg-white rounded-2xl border border-[#efefef] p-4 flex items-center gap-3 hover:shadow-sm active:scale-[0.99] transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#f6f6f6] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-[#5d5d5d]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#2f2f2f] truncate">{a.title}</p>
                      <p className="text-xs text-[#a9a9a9] mt-0.5 truncate font-inter">
                        {a.subject} · {a.className}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        STATUS_COLORS[a.status] ?? 'bg-[#f0f0f0] text-[#5d5d5d]'
                      }`}
                    >
                      {STATUS_LABELS[a.status] ?? a.status}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Pro tip ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.65 }}
          className="p-4 rounded-2xl bg-white border border-[#efefef] flex items-start gap-3"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#2f2f2f]">Pro tip</p>
            <p className="text-xs text-[#a9a9a9] mt-0.5 font-inter leading-relaxed">
              Use voice input to dictate additional instructions while creating assignments — tap the mic icon in the form.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
