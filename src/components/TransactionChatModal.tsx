/**
 * ============================================================================
 * IN-TRANSACTION LIVE MESSAGING MODAL (src/components/TransactionChatModal.tsx)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Provides an in-app private chat window for the lender and borrower:
 * 1. Loads chronological message history for the transaction.
 * 2. Auto-scrolls to the newest message using React refs (`scrollIntoView`).
 * 3. Polls `/api/transactions/[id]/messages` every 3 seconds while open.
 * 4. Enables sending messages (e.g. "I am waiting outside Raman Hostel").
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Polling-Based Real-Time Chat: Uses `setInterval` while the modal is open,
 *    achieving reliable real-time message delivery without requiring heavy WebSocket
 *    infrastructure.
 * 2. Automatic Scroll Anchoring: Uses `messagesEndRef` attached to a zero-height
 *    div at the bottom of the list for smooth auto-scrolling when new messages arrive.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this component is our transaction chat modal. It lets borrower and lender
 * message each other in real-time to coordinate physical handovers, pickup times,
 * and meeting spots on campus."
 * ============================================================================
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, MapPin, User } from 'lucide-react';
import { formatCustomDate } from '@/lib/utils';

interface ChatModalProps {
  transactionId: string;
  itemTitle: string;
  counterpartName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionChatModal({
  transactionId,
  itemTitle,
  counterpartName,
  isOpen,
  onClose,
}: ChatModalProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * --------------------------------------------------------------------------
   * fetchMessages():
   * Queries latest messages for this specific transaction from SQLite.
   * --------------------------------------------------------------------------
   */
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/transactions/${transactionId}/messages`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Poll for new messages every 3 seconds while modal is open
  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, transactionId]);

  // Smooth auto-scroll to latest message when messages array updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * --------------------------------------------------------------------------
   * handleSendMessage():
   * Posts message to `/api/transactions/[id]/messages` and refreshes feed.
   * --------------------------------------------------------------------------
   */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${transactionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setContent('');
        fetchMessages();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full h-[520px] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 transition-colors">
        {/* Header */}
        <div className="bg-teal-800 dark:bg-teal-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-700/80 rounded-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">{itemTitle}</h3>
              <p className="text-xs text-teal-200">Chat with {counterpartName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-teal-200 hover:text-white hover:bg-teal-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Coordination Banner */}
        <div className="bg-mint-50 dark:bg-teal-950/40 border-b border-teal-100 dark:border-teal-900/50 px-4 py-2 text-xs text-teal-900 dark:text-teal-300 flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>Coordinate campus handover, meetups, and item return here safely.</span>
        </div>

        {/* Chronological Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
              No messages yet. Say hi and agree on a campus meetup location!
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="flex flex-col space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{m.sender.name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">({m.sender.studentId || 'IIIT-NR'})</span>
                  <span>•</span>
                  <span>{formatCustomDate(m.createdAt)}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl rounded-tl-xs text-xs text-slate-800 dark:text-slate-100 shadow-2xs leading-relaxed max-w-[85%] self-start whitespace-pre-wrap">
                  {m.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form Footer */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type message (e.g., 'Meet near Raman reception at 5 PM')..."
            className="flex-1 px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
