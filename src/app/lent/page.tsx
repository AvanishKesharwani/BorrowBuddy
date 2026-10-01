/**
 * ============================================================================
 * LENDER DASHBOARD & INCOMING REQUESTS (src/app/lent/page.tsx)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * The lender command center where students manage items they share with peers:
 * 1. "Borrow Requests" Tab: Review incoming borrow requests with requester's
 *    branch, roll number, and reputation score. Accept or Reject with one click.
 * 2. "Active Loans" Tab: Monitor items currently with other students, inspect
 *    return deadlines, and physically confirm returns (`Confirm Return` button).
 * 3. "My Listed Inventory" Tab: Overview of all equipment published by this student,
 *    availability status badges, and quick button to create new listings.
 * 4. Modals: Opens In-Transaction Chat, Peer Ratings, or Dispute filing.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Two-Way Peer Verification: Protects lenders by giving them full authority
 *    to accept requests and finalize physical return handovers.
 * 2. Relational Profile Lookup: Fetches borrower trust scores to help lenders make
 *    informed borrowing decisions.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this is the 'Lent Items' dashboard. Lenders use this screen to approve
 * or decline incoming borrow requests from peers, track who currently has their items,
 * and confirm when items are safely returned."
 * ============================================================================
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  Star,
  PlusCircle,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { formatCustomDate, formatINR, getStatusBadgeStyle } from '@/lib/utils';
import TransactionChatModal from '@/components/TransactionChatModal';
import RatingModal from '@/components/RatingModal';
import DisputeModal from '@/components/DisputeModal';

export default function MyLentItemsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [myItems, setMyItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'listings'>('requests');

  // Modals & loading states
  const [chatTx, setChatTx] = useState<any | null>(null);
  const [rateTx, setRateTx] = useState<any | null>(null);
  const [disputeTx, setDisputeTx] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [txRes, meRes] = await Promise.all([
        fetch('/api/transactions?type=lent'),
        fetch('/api/auth/me'),
      ]);

      const txData = await txRes.json();
      const meData = await meRes.json();

      setTransactions(txData.transactions || []);

      if (meData.user) {
        const profileRes = await fetch(`/api/profile/${meData.user.id}`);
        const profileData = await profileRes.json();
        if (profileData.user?.items) {
          setMyItems(profileData.user.items);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptRequest = async (txId: string) => {
    setActionLoading(txId);
    try {
      const res = await fetch(`/api/transactions/${txId}/accept`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setFeedback('Request accepted! The item is now marked BORROWED and transaction is ACTIVE.');
        setTimeout(() => setFeedback(null), 4000);
        fetchData();
      } else {
        alert(data.error || 'Failed to accept');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (txId: string) => {
    setActionLoading(txId);
    try {
      const res = await fetch(`/api/transactions/${txId}/reject`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setFeedback('Borrow request declined.');
        setTimeout(() => setFeedback(null), 4000);
        fetchData();
      } else {
        alert(data.error || 'Failed to reject');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmReturn = async (txId: string) => {
    setActionLoading(txId);
    try {
      const res = await fetch(`/api/transactions/${txId}/confirm-return`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setFeedback('Return confirmed! Item is now available for other students again.');
        setTimeout(() => setFeedback(null), 4000);
        fetchData();
      } else {
        alert(data.error || 'Failed to confirm return');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingRequests = transactions.filter((t) => t.status === 'REQUESTED');
  const activeLent = transactions.filter((t) =>
    ['ACTIVE', 'OVERDUE', 'RETURN_PENDING', 'DISPUTED'].includes(t.status)
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-4xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-mint-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 rounded-2xl border border-teal-200/40 dark:border-teal-700/50">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
              BorrowBuddy Peer Lending
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Lending &amp; Requests Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review borrow requests from students, approve transactions, and confirm safe returns.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tabs with sliding morph pill */}
          <div className="relative flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full text-xs font-bold overflow-x-auto scrollbar-none">
            {[
              {
                id: 'requests',
                label: 'Incoming Requests',
                badge: pendingRequests.length > 0 ? pendingRequests.length : null,
              },
              {
                id: 'active',
                label: `Currently Lent (${activeLent.length})`,
                badge: null,
              },
              {
                id: 'listings',
                label: `My Listings (${myItems.length})`,
                badge: null,
              },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-4 py-2 rounded-full transition-colors duration-200 z-10 whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'text-teal-900 dark:text-teal-200'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="lentTabPill"
                      className="absolute inset-0 bg-white dark:bg-slate-700 rounded-full shadow-xs z-[-1]"
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 35,
                      }}
                    />
                  )}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <a
            href="/items/new"
            className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List Item</span>
          </a>
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-mint-100 border border-teal-200 text-teal-900 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Tab Content */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs">Loading requests and listings...</p>
        </div>
      ) : activeTab === 'requests' ? (
        /* Incoming Requests Section */
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-4xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
              <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Pending Requests</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                When a student requests to borrow one of your listed items, it will appear here for your approval.
              </p>
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20 p-5 sm:p-6 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={req.item.imageUrl}
                      alt={req.item.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div>
                      <span className="bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/60 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        New Borrow Request
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                        {req.item.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <span>Requested by:</span>
                        <strong className="text-teal-800 dark:text-teal-300">{req.borrower.name}</strong>
                        <span>({req.borrower.studentId || 'IIIT-NR'}, {req.borrower.branch})</span>
                      </p>
                    </div>
                  </div>

                  {/* Borrower trust snapshot */}
                  <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="text-center px-2">
                      <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-black text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {req.borrower.rating.toFixed(1)}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Rating</span>
                    </div>
                    <div className="border-l border-slate-200 dark:border-slate-700 h-6"></div>
                    <div className="text-center px-2">
                      <div className="flex items-center gap-1 text-teal-700 dark:text-teal-300 font-black text-xs">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {req.borrower.reliabilityScore.toFixed(0)}%
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Reliability</span>
                    </div>
                  </div>
                </div>

                {/* Purpose & Handover note */}
                <div className="p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs space-y-1">
                  <p className="text-slate-500 dark:text-slate-400 font-semibold">Borrower&apos;s Meetup Note:</p>
                  <p className="text-slate-800 dark:text-slate-200 italic">
                    &ldquo;{req.borrowerNotes || 'Would like to borrow this item for academic coursework.'}&rdquo;
                  </p>
                  <div className="pt-2 text-slate-500 dark:text-slate-400 flex items-center gap-4 text-[11px]">
                    <span>
                      Requested Return Deadline: <strong className="text-slate-800 dark:text-slate-200">{formatCustomDate(req.deadline)}</strong>
                    </span>
                    <span>
                      Campus Handover Point: <strong className="text-slate-800 dark:text-slate-200">{req.item.campusLocation}</strong>
                    </span>
                  </div>
                </div>

                {/* Action Buttons: Accept / Reject */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleRejectRequest(req.id)}
                    disabled={actionLoading === req.id}
                    className="px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full transition flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Decline</span>
                  </button>

                  <button
                    onClick={() => handleAcceptRequest(req.id)}
                    disabled={actionLoading === req.id}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 rounded-full shadow-xs transition flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{actionLoading === req.id ? 'Accepting...' : 'Accept Borrow Request'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'active' ? (
        /* Currently Lent Section */
        <div className="space-y-4">
          {activeLent.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-4xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
              <Layers className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Items Currently Lent Out</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Accepted transactions will show up here until the borrower returns the object and you confirm receipt.
              </p>
            </div>
          ) : (
            activeLent.map((tx) => {
              const badgeStyle = getStatusBadgeStyle(tx.status);
              const isOverdue = tx.status === 'OVERDUE';
              const isReturnPending = tx.status === 'RETURN_PENDING';
              const isDisputed = tx.status === 'DISPUTED';
              const isReturned = tx.status === 'RETURNED';

              return (
                <div
                  key={tx.id}
                  className={`bg-white dark:bg-slate-900 rounded-3xl border p-5 sm:p-6 shadow-xs space-y-4 ${
                    isReturnPending
                      ? 'border-purple-300 dark:border-purple-800/80 bg-purple-50/20 dark:bg-purple-950/20'
                      : isOverdue
                      ? 'border-rose-300 dark:border-rose-800/80 bg-rose-50/20 dark:bg-rose-950/20'
                      : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={tx.item.imageUrl}
                        alt={tx.item.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                          >
                            {tx.status}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{tx.item.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Possessed by: <strong className="text-slate-800 dark:text-slate-200">{tx.borrower.name}</strong> (
                          {tx.borrower.studentId || 'IIIT-NR'}, {tx.borrower.branch})
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold block">Scheduled Deadline</span>
                      <span
                        className={`text-xs font-bold flex items-center justify-end gap-1 ${
                          isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {formatCustomDate(tx.deadline)}
                      </span>
                    </div>
                  </div>

                  {/* Return Confirmation Prompt (Two-Step Return!) */}
                  {isReturnPending && (
                    <div className="p-4 bg-purple-100/90 dark:bg-purple-950/50 border border-purple-300 dark:border-purple-800 rounded-2xl text-xs text-purple-900 dark:text-purple-200 space-y-2">
                      <span className="font-bold flex items-center gap-1.5 text-purple-950 dark:text-purple-300">
                        <CheckCircle className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                        Borrower Marked Item as Returned!
                      </span>
                      <p>
                        <strong>{tx.borrower.name}</strong> has returned this item. Please
                        physically inspect the item&apos;s condition and click <strong>Confirm Return Received</strong> to close
                        this transaction and return the item to Available status.
                      </p>
                    </div>
                  )}

                  {/* Overdue Warning */}
                  {isOverdue && (
                    <div className="p-3 bg-rose-100 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-2xl text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between">
                      <span>
                        ⚠️ Item is <strong>{tx.overdueDays} day(s) overdue</strong>. Penalty of {formatINR(tx.penalty)} has been generated.
                      </span>
                    </div>
                  )}

                  {/* Dispute warning */}
                  {isDisputed && (
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-2xl text-xs text-orange-900 dark:text-orange-200 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                      <span>Dispute raised. Admin is currently reviewing transaction activity.</span>
                    </div>
                  )}

                  {/* Actions row */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setChatTx(tx)}
                        className="inline-flex items-center gap-1 text-teal-800 dark:text-teal-200 bg-mint-100 dark:bg-teal-900/60 hover:bg-mint-200 dark:hover:bg-teal-800 px-3.5 py-2 rounded-full font-bold transition border border-teal-200/40 dark:border-teal-700/50"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>Chat with {tx.borrower.name.split(' ')[0]}</span>
                      </button>

                      {!isDisputed && (
                        <button
                          onClick={() => setDisputeTx(tx)}
                          className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 px-2 py-1.5 font-medium transition"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Raise Dispute</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Confirm Return Action */}
                      {(isReturnPending || isOverdue || tx.status === 'ACTIVE') && (
                        <button
                          onClick={() => handleConfirmReturn(tx.id)}
                          disabled={actionLoading === tx.id}
                          className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-full shadow-xs transition flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{actionLoading === tx.id ? 'Confirming...' : 'Confirm Return Received'}</span>
                        </button>
                      )}

                      {isReturned && (
                        <button
                          onClick={() => setRateTx(tx)}
                          className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-full shadow-xs transition flex items-center gap-1.5"
                        >
                          <Star className="w-4 h-4 fill-white" />
                          <span>Rate Borrower</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* My Listings Tab */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {myItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col justify-between p-5 transition-colors"
            >
              <div>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-40 object-cover rounded-2xl mb-3 border border-slate-100 dark:border-slate-800"
                />
                <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider block">
                  {item.category}
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 line-clamp-1">{item.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{item.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-teal-800 dark:text-teal-200 bg-mint-100 dark:bg-teal-900/60 border border-teal-200/40 dark:border-teal-700/50 px-2.5 py-0.5 rounded-full">
                  {item.availability}
                </span>
                <a
                  href={`/items/${item.id}`}
                  className="text-teal-700 dark:text-teal-400 font-bold hover:underline"
                >
                  View Listing &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction Handover Chat Modal */}
      {chatTx && (
        <TransactionChatModal
          transactionId={chatTx.id}
          itemTitle={chatTx.item.name}
          counterpartName={chatTx.borrower.name}
          isOpen={!!chatTx}
          onClose={() => setChatTx(null)}
        />
      )}

      {/* Rating Modal */}
      {rateTx && (
        <RatingModal
          transactionId={rateTx.id}
          itemTitle={rateTx.item.name}
          revieweeName={rateTx.borrower.name}
          isOpen={!!rateTx}
          onClose={() => setRateTx(null)}
          onSuccess={() => {
            fetchData();
            setFeedback('Thank you! Borrower rating recorded.');
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
            fetchData();
            setFeedback('Dispute submitted to campus administrator.');
          }}
        />
      )}
    </div>
  );
}
