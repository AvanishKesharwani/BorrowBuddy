'use client';

import React, { useState, useEffect } from 'react';
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
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-6 sm:p-8 rounded-4xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-mint-100 text-teal-700 rounded-2xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
              BorrowBuddy Peer Lending
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Lending &amp; Requests Management
            </h1>
            <p className="text-xs text-slate-500">
              Review borrow requests from students, approve transactions, and confirm safe returns.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-full text-xs font-bold">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-full transition flex items-center gap-1.5 ${
                activeTab === 'requests'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Incoming Requests</span>
              {pendingRequests.length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-full transition ${
                activeTab === 'active'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Currently Lent ({activeLent.length})
            </button>
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 rounded-full transition ${
                activeTab === 'listings'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Listings ({myItems.length})
            </button>
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
            <div className="bg-white rounded-4xl p-12 text-center border border-slate-200 shadow-xs space-y-2">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Pending Requests</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When a student requests to borrow one of your listed items, it will appear here for your approval.
              </p>
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-amber-200 bg-amber-50/20 p-5 sm:p-6 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={req.item.imageUrl}
                      alt={req.item.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <span className="bg-amber-100 text-amber-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        New Borrow Request
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                        {req.item.name}
                      </h3>
                      <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                        <span>Requested by:</span>
                        <strong className="text-teal-800">{req.borrower.name}</strong>
                        <span>({req.borrower.studentId || 'IIIT-NR'}, {req.borrower.branch})</span>
                      </p>
                    </div>
                  </div>

                  {/* Borrower trust snapshot */}
                  <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200">
                    <div className="text-center px-2">
                      <div className="flex items-center gap-1 text-amber-500 font-black text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {req.borrower.rating.toFixed(1)}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Rating</span>
                    </div>
                    <div className="border-l border-slate-200 h-6"></div>
                    <div className="text-center px-2">
                      <div className="flex items-center gap-1 text-teal-700 font-black text-xs">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {req.borrower.reliabilityScore.toFixed(0)}%
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Reliability</span>
                    </div>
                  </div>
                </div>

                {/* Purpose & Handover note */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-xs space-y-1">
                  <p className="text-slate-500 font-semibold">Borrower&apos;s Meetup Note:</p>
                  <p className="text-slate-800 italic">
                    &ldquo;{req.borrowerNotes || 'Would like to borrow this item for academic coursework.'}&rdquo;
                  </p>
                  <div className="pt-2 text-slate-500 flex items-center gap-4 text-[11px]">
                    <span>
                      Requested Return Deadline: <strong>{formatCustomDate(req.deadline)}</strong>
                    </span>
                    <span>
                      Campus Handover Point: <strong>{req.item.campusLocation}</strong>
                    </span>
                  </div>
                </div>

                {/* Action Buttons: Accept / Reject */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleRejectRequest(req.id)}
                    disabled={actionLoading === req.id}
                    className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-full transition flex items-center gap-1"
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
            <div className="bg-white rounded-4xl p-12 text-center border border-slate-200 shadow-xs space-y-2">
              <Layers className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Items Currently Lent Out</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
                  className={`bg-white rounded-3xl border p-5 sm:p-6 shadow-xs space-y-4 ${
                    isReturnPending
                      ? 'border-purple-300 bg-purple-50/20'
                      : isOverdue
                      ? 'border-rose-300 bg-rose-50/20'
                      : 'border-slate-200/80'
                  }`}
                >
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={tx.item.imageUrl}
                        alt={tx.item.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                          >
                            {tx.status}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{tx.item.name}</h3>
                        <p className="text-xs text-slate-500">
                          Possessed by: <strong className="text-slate-800">{tx.borrower.name}</strong> (
                          {tx.borrower.studentId || 'IIIT-NR'}, {tx.borrower.branch})
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 font-semibold block">Scheduled Deadline</span>
                      <span
                        className={`text-xs font-bold flex items-center justify-end gap-1 ${
                          isOverdue ? 'text-rose-600' : 'text-slate-800'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {formatCustomDate(tx.deadline)}
                      </span>
                    </div>
                  </div>

                  {/* Return Confirmation Prompt (Two-Step Return!) */}
                  {isReturnPending && (
                    <div className="p-4 bg-purple-100/90 border border-purple-300 rounded-2xl text-xs text-purple-900 space-y-2">
                      <span className="font-bold flex items-center gap-1.5 text-purple-950">
                        <CheckCircle className="w-4 h-4 text-purple-700" />
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
                    <div className="p-3 bg-rose-100 border border-rose-300 rounded-2xl text-xs text-rose-900 flex items-center justify-between">
                      <span>
                        ⚠️ Item is <strong>{tx.overdueDays} day(s) overdue</strong>. Penalty of {formatINR(tx.penalty)} has been generated.
                      </span>
                    </div>
                  )}

                  {/* Dispute warning */}
                  {isDisputed && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl text-xs text-orange-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
                      <span>Dispute raised. Admin is currently reviewing transaction activity.</span>
                    </div>
                  )}

                  {/* Actions row */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setChatTx(tx)}
                        className="inline-flex items-center gap-1 text-teal-800 bg-mint-100 hover:bg-mint-200 px-3.5 py-2 rounded-full font-bold transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-teal-600" />
                        <span>Chat with {tx.borrower.name.split(' ')[0]}</span>
                      </button>

                      {!isDisputed && (
                        <button
                          onClick={() => setDisputeTx(tx)}
                          className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 px-2 py-1.5 font-medium transition"
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
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs flex flex-col justify-between p-5"
            >
              <div>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-40 object-cover rounded-2xl mb-3"
                />
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                  {item.category}
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1">{item.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-teal-800 bg-mint-100 px-2.5 py-0.5 rounded-full">
                  {item.availability}
                </span>
                <a
                  href={`/items/${item.id}`}
                  className="text-teal-700 font-bold hover:underline"
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
