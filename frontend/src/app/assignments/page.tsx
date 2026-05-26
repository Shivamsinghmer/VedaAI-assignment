'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search, MoreVertical, Plus, SlidersHorizontal,
  Eye, Trash2, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { formatDate } from '@/lib/utils';
import { Assignment } from '@/types';
import Header from '@/components/layout/Header';

const STATUS_PILL: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

const ALL_STATUSES = ['pending', 'processing', 'completed', 'failed'] as const;
const PAGE_SIZE = 10;

export default function AssignmentsPage() {
  const { assignments, isLoadingList, fetchAssignments, deleteAssignment } = useAssignmentStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);
  useEffect(() => { setPage(1); }, [search, statusFilters]);

  const filtered = assignments.filter((a) => {
    const q = search.toLowerCase();
    const matchesSearch = a.title.toLowerCase().includes(q) || a.subject.toLowerCase().includes(q);
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(a.status);
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleStatus(s: string) {
    setStatusFilters((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this assignment?')) return;
    setDeletingId(id);
    try { await deleteAssignment(id); } finally { setDeletingId(null); }
  }

  function getPageNumbers(current: number, total: number): (number | '…')[] {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '…')[] = [1];
    if (current > 3) pages.push('…');
    for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
    if (current < total - 2) pages.push('…');
    pages.push(total);
    return pages;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        breadcrumb="Assignment"
        showBack={false}
        mobileTitle="Assignments"
        backHref="/assignments"
      />

      <div className="flex-1 p-4 lg:p-6">
        {/* Page title — desktop */}
        <div className="mb-5 hidden lg:block">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4bc16c] shrink-0" />
            <h1 className="text-xl font-bold text-[#2f2f2f]">Assignments</h1>
          </div>
          <p className="text-sm text-[#5d5d5d] mt-0.5 font-inter ml-[18px]">
            Manage and create assignments for your classes.
          </p>
        </div>

        {/* Loading */}
        {isLoadingList && (
          <div className="flex justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              className="w-7 h-7 rounded-full border-2 border-[#171717] border-t-transparent"
            />
          </div>
        )}

        {/* Empty state */}
        {!isLoadingList && assignments.length === 0 && <EmptyState />}

        {/* Filled state */}
        {!isLoadingList && assignments.length > 0 && (
          <>
            {/* Filter + Search row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 mb-4"
            >
              {/* Filter By button */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setFilterOpen((v) => !v)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-[#e8e8e8] text-sm text-[#5d5d5d] hover:bg-[#f6f6f6] transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Filter</span>
                  {statusFilters.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#171717] text-white text-[10px] font-bold flex items-center justify-center">
                      {statusFilters.length}
                    </span>
                  )}
                </button>

                {/* Filter dropdown */}
                <AnimatePresence>
                  {filterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-12 w-52 bg-white rounded-2xl border border-[#efefef] shadow-lg z-20 p-3"
                    >
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-xs font-bold text-[#2f2f2f]">Filter by Status</span>
                        {statusFilters.length > 0 && (
                          <button
                            onClick={() => setStatusFilters([])}
                            className="text-[10px] text-[#a9a9a9] hover:text-red-500 transition-colors"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      {ALL_STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => toggleStatus(s)}
                          className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[#f6f6f6] transition-colors"
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${statusFilters.includes(s) ? 'bg-[#171717] border-[#171717]' : 'border-[#d0d0d0]'}`}>
                            {statusFilters.includes(s) && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-sm capitalize ${STATUS_PILL[s].split(' ')[1]}`}>{s}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a9a9a9]" />
                <input
                  type="text"
                  placeholder="Search assignments…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-[#e8e8e8] text-sm text-[#2f2f2f] placeholder:text-[#a9a9a9] focus:outline-none focus:border-[#2f2f2f] transition-colors"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a9a9a9] hover:text-[#2f2f2f]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>

            {/* Active filter chips */}
            {statusFilters.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 mb-4"
              >
                {statusFilters.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleStatus(s)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_PILL[s]}`}
                  >
                    {s}
                    <X className="w-3 h-3" />
                  </button>
                ))}
              </motion.div>
            )}

            {/* Showing count */}
            {filtered.length > 0 && (
              <p className="text-xs text-[#a9a9a9] mb-3 font-inter">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} assignments
              </p>
            )}

            {/* Cards grid */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              onClick={() => setFilterOpen(false)}
            >
              <AnimatePresence mode="popLayout">
                {paginated.map((a, i) => (
                  <motion.div
                    key={a._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: i * 0.05 }}
                  >
                    <AssignmentCard
                      assignment={a}
                      onDelete={() => handleDelete(a._id)}
                      isDeleting={deletingId === a._id}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-sm text-[#a9a9a9] font-inter mb-3">No assignments match your filters.</p>
                <button
                  onClick={() => { setSearch(''); setStatusFilters([]); }}
                  className="text-sm font-semibold text-[#2f2f2f] underline"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex items-center justify-center gap-2 mt-6 mb-4"
              >
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-2 bg-white rounded-xl border border-[#e8e8e8] text-sm text-[#2f2f2f] hover:bg-[#f6f6f6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers(page, totalPages).map((p, idx) =>
                    p === '…' ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="w-9 h-9 flex items-center justify-center text-sm text-[#a9a9a9]"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                          p === page
                            ? 'bg-[#171717] text-white'
                            : 'bg-white border border-[#e8e8e8] text-[#5d5d5d] hover:bg-[#f6f6f6]'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-2 bg-white rounded-xl border border-[#e8e8e8] text-sm text-[#2f2f2f] hover:bg-[#f6f6f6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* FAB */}
      {!isLoadingList && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.4 }}
        >
          <Link
            href="/assignments/create"
            className="lg:hidden fixed bottom-24 right-4 w-14 h-14 rounded-full bg-[#4bc16c] flex items-center justify-center shadow-lg hover:bg-[#3da95c] active:scale-95 transition-all z-30"
          >
            <Plus className="w-6 h-6 text-white" />
          </Link>
          <Link
            href="/assignments/create"
            className="hidden lg:flex fixed bottom-6 left-[calc(50%+110px)] -translate-x-1/2 items-center gap-2 bg-[#171717] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg hover:bg-[#2f2f2f] transition-colors z-30 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Create Assignment
          </Link>
        </motion.div>
      )}
    </div>
  );
}

/* ── Assignment Card ───────────────────────────────────────────── */

function AssignmentCard({ assignment, onDelete, isDeleting }: {
  assignment: Assignment;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <div className="bg-white rounded-2xl border border-[#efefef] p-4 hover:shadow-md transition-shadow relative">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#2f2f2f] text-sm leading-snug truncate">{assignment.title}</h3>
          <p className="text-xs text-[#a9a9a9] mt-0.5 truncate font-inter">
            {assignment.subject} · {assignment.className}
          </p>
          <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_PILL[assignment.status]}`}>
            {assignment.status}
          </span>
        </div>

        {/* 3-dot menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-[#f6f6f6] transition-colors text-[#a9a9a9]"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-8 w-44 bg-white rounded-xl border border-[#efefef] shadow-lg z-20 overflow-hidden py-1"
              >
                {assignment.status === 'completed' && (
                  <Link
                    href={`/assignments/${assignment._id}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#2f2f2f] hover:bg-[#f6f6f6] transition-colors"
                  >
                    <Eye className="w-4 h-4 text-[#5d5d5d]" />
                    View Assignment
                  </Link>
                )}
                {(assignment.status === 'pending' || assignment.status === 'processing') && (
                  <Link
                    href={`/assignments/${assignment._id}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#2f2f2f] hover:bg-[#f6f6f6] transition-colors"
                  >
                    <Eye className="w-4 h-4 text-[#5d5d5d]" />
                    Track Progress
                  </Link>
                )}
                <button
                  onClick={() => { setMenuOpen(false); onDelete(); }}
                  disabled={isDeleting}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? 'Deleting…' : 'Delete'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Dates */}
      <div className="mt-3 pt-3 border-t border-[#f0f0f0] flex flex-wrap items-center gap-x-4 gap-y-1 font-inter">
        <span className="text-xs text-[#5d5d5d]">
          <span className="font-semibold">Assigned:</span> {formatDate(assignment.createdAt)}
        </span>
        <span className="text-xs text-[#5d5d5d]">
          <span className="font-semibold">Due:</span> {formatDate(assignment.dueDate)}
        </span>
      </div>
    </div>
  );
}

/* ── Empty State ───────────────────────────────────────────────── */

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 text-center px-4"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
      >
        <Image src="/no-assignment.png" alt="No assignments" width={200} height={200} className="mb-6" />
      </motion.div>
      <h2 className="text-xl font-bold text-[#2f2f2f] mb-2">No assignments yet</h2>
      <p className="text-sm text-[#5d5d5d] max-w-sm leading-relaxed mb-8 font-inter">
        Create your first assignment to start collecting and grading student submissions.
      </p>
      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
        <Link
          href="/assignments/create"
          className="flex items-center gap-2 bg-[#171717] text-white px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-[#2f2f2f] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Your First Assignment
        </Link>
      </motion.div>
    </motion.div>
  );
}
