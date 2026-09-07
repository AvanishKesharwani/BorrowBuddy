'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, Clock, MessageCircle, AlertTriangle } from 'lucide-react';
import { formatCustomDate } from '@/lib/utils';
import TransactionChatModal from '@/components/TransactionChatModal';

export default function DisputesPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatTx, setChatTx] = useState<any | null>(null);

  const fetchDisputes = async () => {
    try {
      const res = await fetch('/api/transactions?type=all');
      const data = await res.json();
      const disputed = (data.transactions || []).filter(
        (t: any) => t.status === 'DISPUTED' || (t.disputes && t.disputes.length > 0)
      );
      setTransactions(disputed);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Campus Dispute Center</h1>
          <p className="text-xs text-slate-500">
            Fair conflict mediation for lost or disputed campus equipment overseen by faculty admin.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs">Loading disputes...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Active Disputes</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All your campus transactions are in good standing with zero open disputes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white rounded-3xl border border-orange-200 p-6 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <span className="bg-orange-100 text-orange-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    {tx.status === 'DISPUTED' ? 'UNDER INVESTIGATION' : 'RESOLVED'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{tx.item.name}</h3>
                  <p className="text-xs text-slate-500">
                    Owner: <strong>{tx.owner.name}</strong> • Borrower: <strong>{tx.borrower.name}</strong>
                  </p>
                </div>

                <button
                  onClick={() => setChatTx(tx)}
                  className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl text-xs font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>View Handover Chat</span>
                </button>
              </div>

              {tx.disputes?.map((d: any) => (
                <div
                  key={d.id}
                  className="p-4 bg-orange-50/60 border border-orange-200 rounded-2xl text-xs space-y-2"
                >
                  <div className="flex items-center justify-between text-orange-950 font-semibold">
                    <span>Reason for Dispute:</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      {formatCustomDate(d.createdAt)}
                    </span>
                  </div>
                  <p className="text-slate-800 italic">&ldquo;{d.reason}&rdquo;</p>
                  {d.resolutionNotes && (
                    <div className="pt-2 border-t border-orange-200 text-emerald-900 font-medium">
                      <strong>Admin Resolution:</strong> {d.resolutionNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {chatTx && (
        <TransactionChatModal
          transactionId={chatTx.id}
          itemTitle={chatTx.item.name}
          counterpartName="Counterparty"
          isOpen={!!chatTx}
          onClose={() => setChatTx(null)}
        />
      )}
    </div>
  );
}
