import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { getStudentBorrows } from '../api/student';
import {
  BookmarkCheck,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BookMarked,
  GraduationCap,
} from 'lucide-react';

export const StudentBorrowed: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const memberId = user?.id || '';

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'returned'>('all');

  const borrowsQuery = useQuery({
    queryKey: ['student-borrowed-page', memberId],
    queryFn: () => getStudentBorrows(memberId),
  });

  const borrows = borrowsQuery.data || [];

  const filteredBorrows = borrows.filter((item) => {
    if (activeTab === 'active') return item.status === 'BORROWED' || item.status === 'OVERDUE';
    if (activeTab === 'returned') return item.status === 'RETURNED';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-gold">
            <GraduationCap className="h-4 w-4" />
            <span>Student Loan History</span>
          </div>
          <h1 className="mt-1 font-serif text-2xl font-normal text-app-text sm:text-3xl">
            My Borrowed Books
          </h1>
          <p className="text-xs text-gray-500">
            Track active book loans, due dates, return timestamps, and digital access.
          </p>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex border-b border-app-border">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === 'all'
              ? 'border-amber-gold text-amber-gold'
              : 'border-transparent text-gray-500 hover:text-charcoal'
          }`}
        >
          All Records ({borrows.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === 'active'
              ? 'border-amber-gold text-amber-gold'
              : 'border-transparent text-gray-500 hover:text-charcoal'
          }`}
        >
          Active Loans ({borrows.filter((b) => b.status === 'BORROWED' || b.status === 'OVERDUE').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('returned')}
          className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === 'returned'
              ? 'border-amber-gold text-amber-gold'
              : 'border-transparent text-gray-500 hover:text-charcoal'
          }`}
        >
          Returned ({borrows.filter((b) => b.status === 'RETURNED').length})
        </button>
      </div>

      {/* Records Table / List */}
      {borrowsQuery.isLoading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading loan records...</div>
      ) : filteredBorrows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-app-border p-12 text-center">
          <BookmarkCheck className="mx-auto h-10 w-10 text-gray-400" />
          <h3 className="mt-3 text-base font-semibold text-app-text">No borrow records found</h3>
          <p className="mt-1 text-xs text-gray-500">You currently have no books matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBorrows.map((record) => {
            const borrowDateObj = new Date(record.borrowDate);
            const dueDateObj = new Date(record.dueDate);
            const isOverdue = record.status === 'OVERDUE' || (record.status === 'BORROWED' && dueDateObj < new Date());

            return (
              <div
                key={record.id}
                className="flex flex-col gap-4 rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-gold/15 text-amber-gold">
                    <BookOpen className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-app-text">{record.book?.title || 'Library Book'}</h3>
                    <p className="text-xs text-gray-500">Author: {record.book?.author || 'N/A'}</p>
                    <p className="mt-1 text-[11px] text-gray-400">ISBN: {record.book?.isbn || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:items-end">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                        record.status === 'RETURNED'
                          ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                          : isOverdue
                          ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                          : 'bg-amber-gold/15 text-amber-gold'
                      }`}
                    >
                      {record.status === 'RETURNED' ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Returned</span>
                        </>
                      ) : isOverdue ? (
                        <>
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>Overdue</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-3.5 w-3.5" />
                          <span>Active Loan</span>
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400">
                    Borrowed: {borrowDateObj.toLocaleDateString()} &bull; Due: {dueDateObj.toLocaleDateString()}
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate(`/student/reader/${record.bookId}`)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-gold hover:underline mt-1"
                  >
                    <BookMarked className="h-3.5 w-3.5" />
                    <span>Read Book Online</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
