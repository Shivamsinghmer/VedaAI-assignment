'use client';

import type { LucideIcon } from 'lucide-react';
import { Sparkles, Mic, FileText, BrainCircuit, ClipboardList, Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { useUIStore } from '@/store/uiStore';

type ToolStatus = 'Active' | 'Coming Soon';

type ToolItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  status: ToolStatus;
  statusClass: string;
  href?: string | null;
};

// Single source of truth for toolkit cards.
const TOOL_ITEMS: ToolItem[] = [
  {
    icon: FileText,
    title: 'Question Paper Generator',
    description: 'AI-powered question paper creation with custom difficulty, marks, and sections.',
    status: 'Active',
    statusClass: 'bg-green-100 text-green-700',
    href: '/assignments/create',
  },
  {
    icon: BrainCircuit,
    title: 'Auto Grader',
    description: 'Upload answer sheets and let AI grade and provide feedback instantly.',
    status: 'Coming Soon',
    statusClass: 'bg-[#f0f0f0] text-[#a9a9a9]',
    href: null,
  },
  {
    icon: ClipboardList,
    title: 'Rubric Builder',
    description: 'Generate detailed marking rubrics for any assignment type in seconds.',
    status: 'Coming Soon',
    statusClass: 'bg-[#f0f0f0] text-[#a9a9a9]',
    href: null,
  },
  {
    icon: Mic,
    title: 'Voice to Text',
    description: 'Dictate instructions or feedback — transcribed instantly with Whisper AI.',
    status: 'Active',
    statusClass: 'bg-green-100 text-green-700',
    href: '/assignments/create',
  },
  {
    icon: Lightbulb,
    title: 'Lesson Planner',
    description: 'Generate structured lesson plans aligned to your curriculum and learning goals.',
    status: 'Coming Soon',
    statusClass: 'bg-[#f0f0f0] text-[#a9a9a9]',
    href: null,
  },
];

const CARD_BASE_CLASS =
  'bg-white rounded-2xl border border-[#efefef] p-5 flex flex-col transition-shadow w-full h-full';
const CARD_HEADER_CLASS = 'flex items-start justify-between gap-2 mb-3';
const CARD_ICON_WRAPPER_CLASS = 'w-10 h-10 rounded-xl bg-[#f6f6f6] flex items-center justify-center shrink-0';
const CARD_TITLE_CLASS = 'font-bold text-sm text-[#2f2f2f]';
const CARD_DESC_CLASS = 'text-xs text-[#5d5d5d] mt-1 leading-relaxed font-inter';
const CARD_CTA_CLASS = 'text-xs font-semibold transition-colors';
const CARD_FOOTER_CLASS = 'mt-4 pt-3 border-t border-[#f6f6f6]';

type ToolCardProps = {
  tool: ToolItem;
  index: number;
  onNotify: (toolTitle: string) => void;
};

function ToolCard({ tool, index, onNotify }: ToolCardProps) {
  const Icon = tool.icon;
  const isActive = tool.status === 'Active';
  const isClickable = isActive && Boolean(tool.href);

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className={`${CARD_BASE_CLASS} ${isActive ? 'hover:shadow-md cursor-pointer' : 'cursor-default'}`}
    >
      <div className={CARD_HEADER_CLASS}>
        <div className={CARD_ICON_WRAPPER_CLASS}>
          <Icon className="w-5 h-5 text-[#2f2f2f]" />
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${tool.statusClass}`}>
          {tool.status}
        </span>
      </div>

      <div className="flex-1">
        <p className={CARD_TITLE_CLASS}>{tool.title}</p>
        <p className={CARD_DESC_CLASS}>{tool.description}</p>
      </div>

      <div className={CARD_FOOTER_CLASS}>
        {isActive ? (
          <span className={`${CARD_CTA_CLASS} text-[#4bc16c]`}>Open tool →</span>
        ) : (
          <button
            onClick={() => onNotify(tool.title)}
            className={`${CARD_CTA_CLASS} text-[#a9a9a9] hover:text-[#2f2f2f]`}
          >
            Notify me →
          </button>
        )}
      </div>
    </motion.div>
  );

  if (isClickable && tool.href) {
    return (
      <Link href={tool.href} className="flex h-full">
        {cardContent}
      </Link>
    );
  }

  return <div className="flex h-full">{cardContent}</div>;
}

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
          {TOOL_ITEMS.map((tool, index) => (
            <ToolCard
              key={tool.title}
              tool={tool}
              index={index}
              onNotify={(toolTitle) =>
                toast(`${toolTitle} is coming soon! We'll notify you when it's ready.`, 'info')
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
