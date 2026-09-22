'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';

interface DisputeModalProps {
  transactionId: string;
  itemTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DisputeModal({
  transactionId,
  itemTitle,
  isOpen,
  onClose,
  onSuccess,
}: DisputeModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/transactions/${transactionId}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to raise dispute');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Raise Campus Dispute</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-200 space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-rose-900 dark:text-rose-300">
            <ShieldAlert className="w-4 h-4" />
            Notice: Administrator Review
          </p>
          <p>
            Opening a dispute marks this transaction as <strong>DISPUTED</strong>. Campus faculty/admin
            will examine chat logs, timestamps, and return claims to resolve the matter fairly.
          </p>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs rounded-xl font-medium border border-rose-200 dark:border-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason / Explanation of Issue with &ldquo;{itemTitle}&rdquo;:
            </label>
            <textarea
              rows={4}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe what happened: e.g. 'Borrower claims item was returned but I have not received it', or 'Item returned with cracked casing'."
              className="w-full text-xs p-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 rounded-xl shadow-xs transition"
            >
              {loading ? 'Submitting Dispute...' : 'File Dispute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
