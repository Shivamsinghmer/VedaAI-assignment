'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { GeneratedPaper, Assignment } from '@/types';
import { PaperPDFDocument } from './PaperPDF';

interface Props {
  paper: GeneratedPaper;
  assignment: Assignment;
  includeAnswers?: boolean;
  compact?: boolean;
}

export default function PDFDownloadButton({ paper, assignment, includeAnswers = true, compact = false }: Props) {
  const fileName = `${assignment.title.replace(/\s+/g, '_')}_${assignment.className}.pdf`;

  const compactClass = 'flex items-center gap-1.5 px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg text-xs font-medium hover:bg-white/20 transition-colors shrink-0';
  const primaryClass = 'flex items-center gap-2 px-4 py-2.5 bg-[#171717] text-white rounded-xl text-sm font-medium hover:bg-[#2f2f2f] disabled:opacity-60 transition-colors shadow-sm';

  return (
    <PDFDownloadLink
      document={<PaperPDFDocument paper={paper} assignment={assignment} includeAnswers={includeAnswers} />}
      fileName={fileName}
    >
      {({ loading }) => (
        <button disabled={loading} className={compact ? compactClass : primaryClass}>
          <Download className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          {loading ? 'Preparing…' : compact ? 'Download as PDF' : includeAnswers ? 'PDF + Answers' : 'Download as PDF'}
        </button>
      )}
    </PDFDownloadLink>
  );
}
