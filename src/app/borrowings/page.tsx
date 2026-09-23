'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
  Star,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { formatCustomDate, formatINR, getStatusBadgeStyle } from '@/lib/utils';
import TransactionChatModal from '@/components/TransactionChatModal';
import RatingModal from '@/components/RatingModal';
import DisputeModal from '@/components/DisputeModal';

export default function MyBorrowingsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'returned'>('active');

  // Modal states
  const [chatTx, setChatTx] = useState<any | null>(null);
  const [rateTx, setRateTx] = useState<any | null>(null);
  const [disputeTx, setDisputeTx] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchBorrowings = async () => {
    try {
      const res = await fetch('/api/transactions?type=borrowed');
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
    const interval = setInterval(fetchBorrowings, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkReturned = async (txId: string) => {
    setActionLoading(txId);
    try {
      const res = await fetch(`/api/transactions/${txId}/return`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setFeedback('Item marked as returned! Owner has been notified to physically confirm receipt.');
        setTimeout(() => setFeedback(null), 4000);
        fetchBorrowings();
      } else {
        alert(data.error || 'Failed to mark return');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === 'active') {
      return ['ACTIVE', 'OVERDUE', 'RETURN_PENDING', 'DISPUTED'].includes(tx.status);
    }
    if (activeTab === 'pending') {
      return ['REQUESTED', 'REJECTED', 'CANCELLED'].includes(tx.status);
    }
    return tx.status === 'RETURNED';
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Page Title */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-4xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-mint-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 rounded-2xl border border-teal-200/40 dark:border-teal-700/50">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
              BorrowBuddy Activity
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">My Borrowed Items</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track items you have borrowed, return deadlines, simulated penalties, and returns.
            </p>
          </div>
        </div>

        {/* Tab Buttons with sliding morph pill */}
        <div className="relative flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full text-xs font-bold overflow-x-auto scrollbar-none">
          {[
            {
              id: 'active',
              label: `Active & Overdue (${transactions.filter((t) => ['ACTIVE', 'OVERDUE', 'RETURN_PENDING', 'DISPUTED'].includes(t.status)).length})`,
            },
            {
              id: 'pending',
              label: `Requests Sent (${transactions.filter((t) => ['REQUESTED', 'REJECTED'].includes(t.status)).length})`,
            },
            {
              id: 'returned',
              label: `History (${transactions.filter((t) => t.status === 'RETURNED').length})`,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-4 py-2 rounded-full transition-colors duration-200 z-10 whitespace-nowrap ${
                  isActive
                    ? 'text-teal-900 dark:text-teal-200'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="borrowingsTabPill"
                    className="absolute inset-0 bg-white dark:bg-slate-700 rounded-full shadow-xs z-[-1]"
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 35,
                    }}
                  />
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-mint-100 border border-teal-200 text-teal-900 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Transactions List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs">Loading borrowings...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-4xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
          <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No items found in this section</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {activeTab === 'active'
              ? 'You currently have no active borrowings on campus. Find items in the catalog!'
              : 'No transaction history found for this category.'}
          </p>
          <a
            href="/explore"
            className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-5 py-2.5 rounded-full transition shadow-xs"
          >
            <span>Explore Campus Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((tx) => {
            const badgeStyle = getStatusBadgeStyle(tx.status);
            const isOverdue = tx.status === 'OVERDUE';
            const isReturnPending = tx.status === 'RETURN_PENDING';
            const isReturned = tx.status === 'RETURNED';
            const isDisputed = tx.status === 'DISPUTED';
            const hasRated = tx.ratings && tx.ratings.some((r: any) => r.reviewerId === tx.borrowerId);

            return (
              <div
                key={tx.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border p-5 sm:p-6 transition shadow-xs space-y-4 ${
                  isOverdue
                    ? 'border-rose-300 dark:border-rose-800/80 bg-rose-50/25 dark:bg-rose-950/20'
                    : isDisputed
                    ? 'border-orange-300 dark:border-orange-800/80 bg-orange-50/20 dark:bg-orange-950/20'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={tx.item.imageUrl}
                      alt={tx.item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-2xs ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                        >
                          {tx.status}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Mode: <strong className="text-slate-800 dark:text-slate-200">{tx.mode}</strong>
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                        {tx.item.name}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <span>Owned by:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{tx.owner.name}</strong>
                        <span>({tx.owner.studentId || 'IIIT-NR'}, {tx.owner.branch})</span>
                      </p>
                    </div>
                  </div>

                  {/* Deadline box */}
                  <div className="text-right sm:self-center">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold block">Return Deadline</span>
                    <span
                      className={`text-xs sm:text-sm font-bold flex items-center justify-end gap-1 ${
                        isOverdue ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {formatCustomDate(tx.deadline)}
                    </span>
                  </div>
                </div>

                {/* Overdue Penalty Banner */}
                {isOverdue && (
                  <div className="p-4 bg-rose-100/90 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-2xl text-xs text-rose-900 dark:text-rose-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5 text-rose-800 dark:text-rose-300 text-sm">
                        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        OVERDUE NOTICE — Return Item Immediately!
                      </span>
                      <span className="font-black text-rose-700 dark:text-rose-300 text-sm bg-rose-200 dark:bg-rose-900/60 px-2.5 py-0.5 rounded-lg">
                        Penalty: {formatINR(tx.penalty)}
                      </span>
                    </div>
                    <p className="text-rose-700 dark:text-rose-300/90">
                      This item is overdue by <strong>{tx.overdueDays} day(s)</strong>. Simulated penalty rate of{' '}
                      <strong>5% per day</strong> on base value {formatINR(tx.item.declaredValue)} has been added.
                      Your Reliability Score has been adjusted.
                    </p>
                  </div>
                )}

                {/* Return Pending Verification Notice */}
                {isReturnPending && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl text-xs text-purple-900 dark:text-purple-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span>
                        You marked this item as returned. Waiting for <strong>{tx.owner.name}</strong> to physically inspect and confirm receipt.
                      </span>
                    </div>
                  </div>
                )}

                {/* Dispute Notice */}
                {isDisputed && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-2xl text-xs text-orange-900 dark:text-orange-200 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                    <span>
                      A dispute has been raised for this transaction. Campus Admin is reviewing the chat logs and return claim.
                    </span>
                  </div>
                )}

                {/* Bottom Actions Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setChatTx(tx)}
                      className="inline-flex items-center gap-1 text-teal-800 dark:text-teal-200 bg-mint-100 dark:bg-teal-900/60 hover:bg-mint-200 dark:hover:bg-teal-800 px-3.5 py-2 rounded-full font-bold transition border border-teal-200/40 dark:border-teal-700/50"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>Chat with {tx.owner.name.split(' ')[0]}</span>
                    </button>

                    {!isDisputed && !isReturned && (
                      <button
                        onClick={() => setDisputeTx(tx)}
                        className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 px-2 py-1.5 font-medium transition"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Raise Dispute</span>
                      </button>
                    )}
                  </div>

                  {/* Return / Rate CTAs */}
                  <div className="flex items-center gap-2">
                    {(tx.status === 'ACTIVE' || tx.status === 'OVERDUE') && (
                      <button
                        onClick={() => handleMarkReturned(tx.id)}
                        disabled={actionLoading === tx.id}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-full shadow-xs transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{actionLoading === tx.id ? 'Submitting...' : 'Mark as Returned'}</span>
                      </button>
                    )}

                    {isReturned && !hasRated && (
                      <button
                        onClick={() => setRateTx(tx)}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-full shadow-xs transition flex items-center gap-1.5"
                      >
                        <Star className="w-4 h-4 fill-white" />
                        <span>Rate Owner &amp; Handover</span>
                      </button>
                    )}

                    {isReturned && hasRated && (
                      <span className="text-teal-800 font-bold bg-mint-100 border border-teal-200 px-3.5 py-1.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Rating Submitted</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Handover Chat Modal */}
      {chatTx && (
        <TransactionChatModal
          transactionId={chatTx.id}
          itemTitle={chatTx.item.name}
          counterpartName={chatTx.owner.name}
          isOpen={!!chatTx}
          onClose={() => setChatTx(null)}
        />
      )}

      {/* Rating Modal */}
      {rateTx && (
        <RatingModal
          transactionId={rateTx.id}
          itemTitle={rateTx.item.name}
          revieweeName={rateTx.owner.name}
          isOpen={!!rateTx}
          onClose={() => setRateTx(null)}
          onSuccess={() => {
            fetchBorrowings();
            setFeedback('Thank you! Your rating has updated the owner’s campus trust score.');
          }}
        />
      )}

      {/* Dispute Modal */}
      {disputeTx && (
        <DisputeModal
          transactionId={disputeTx.id}
          itemTitle={disputeTx.item.name}
          isOpen={!!disputeTx}
          onClose={() => setDisputeTx(null)}
          onSuccess={() => {
            fetchBorrowings();
            setFeedback('Dispute opened. Campus Administrator will investigate.');
          }}
        />
      )}
    </div>
  );
}
