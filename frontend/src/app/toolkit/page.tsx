'use client';

import { Sparkles, Mic, FileText, BrainCircuit, ClipboardList, Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { useUIStore } from '@/store/uiStore';

const TOOLS = [
  {
    icon: FileText,
    title: 'Question Paper Generator',
    desc: 'AI-powered question paper creation with custom difficulty, marks, and sections.',
    badge: 'Active',
    badgeColor: 'bg-green-100 text-green-700',
    href: '/assignments/create',
  },
  {
    icon: BrainCircuit,
    title: 'Auto Grader',
    desc: 'Upload answer sheets and let AI grade and provide feedback instantly.',
    badge: 'Coming Soon',
    badgeColor: 'bg-[#f0f0f0] text-[#a9a9a9]',
    href: null,
  },
  {
    icon: ClipboardList,
    title: 'Rubric Builder',
    desc: 'Generate detailed marking rubrics for any assignment type in seconds.',
    badge: 'Coming Soon',
    badgeColor: 'bg-[#f0f0f0] text-[#a9a9a9]',
    href: null,
  },
  {
    icon: Mic,
    title: 'Voice to Text',
    desc: 'Dictate instructions or feedback — transcribed instantly with Whisper AI.',
    badge: 'Active',
    badgeColor: 'bg-green-100 text-green-700',
    href: '/assignments/create',
  },
  {
    icon: Lightbulb,
    title: 'Lesson Planner',
    desc: 'Generate structured lesson plans aligned to your curriculum and learning goals.',
    badge: 'Coming Soon',
    badgeColor: 'bg-[#f0f0f0] text-[#a9a9a9]',
    href: null,
  },
];

export default function ToolkitPage() {
  const { toast } = useUIStore();

  return (
    <div className="flex flex-col min-h-screen">
      <Header breadcrumb="AI Toolkit" showBack={false} mobileTitle="AI Toolkit" />

      <div className="flex-1 p-4 lg:p-6">
        {/* Page title — desktop */}
        <div className="mb-5 hidden lg:block">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4bc16c] shrink-0" />
            <h1 className="text-xl font-bold text-[#2f2f2f]">AI Teacher&apos;s Toolkit</h1>
          </div>
          <p className="text-sm text-[#5d5d5d] mt-0.5 font-inter ml-[18px]">
            Powerful AI tools built for modern educators.
          </p>
        </div>

        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 p-5 rounded-2xl bg-[#171717] text-white flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Powered by Llama 3.3</p>
            <p className="text-xs text-white/60 mt-0.5">Ultra-fast AI inference for real-time education tools.</p>
          </div>
        </motion.div>

        {/* Tools grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-fr">
          {TOOLS.map((tool, i) => {
            const Icon = tool.icon;
            const isActive = tool.badge === 'Active';

            const cardContent = (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
                className={`bg-white rounded-2xl border border-[#efefef] p-5 flex flex-col transition-shadow w-full h-full ${
                  isActive ? 'hover:shadow-md cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f6f6f6] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#2f2f2f]" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                </div>

                <div className="flex-1">
                  <p className="font-bold text-sm text-[#2f2f2f]">{tool.title}</p>
                  <p className="text-xs text-[#5d5d5d] mt-1 leading-relaxed font-inter">{tool.desc}</p>
                </div>

                {/* Bottom CTA — always present so all cards are equal height */}
                <div className="mt-4 pt-3 border-t border-[#f6f6f6]">
                  {isActive ? (
                    <span className="text-xs font-semibold text-[#4bc16c]">Open tool →</span>
                  ) : (
                    <button
                      onClick={() => toast(`${tool.title} is coming soon! We'll notify you when it's ready.`, 'info')}
                      className="text-xs font-semibold text-[#a9a9a9] hover:text-[#2f2f2f] transition-colors"
                    >
                      Notify me →
                    </button>
                  )}
                </div>
              </motion.div>
            );

            return isActive && tool.href ? (
              <Link key={tool.title} href={tool.href} className="flex">
                {cardContent}
              </Link>
            ) : (
              <div key={tool.title} className="flex">
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
