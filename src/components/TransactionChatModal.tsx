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

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, transactionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      <div className="bg-white rounded-2xl max-w-lg w-full h-[520px] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-blue-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-700/80 rounded-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">{itemTitle}</h3>
              <p className="text-xs text-blue-200">Chat with {counterpartName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-blue-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info banner */}
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-xs text-blue-900 flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Coordinate campus handover, meetups, and item return here safely.</span>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No messages yet. Say hi and agree on a campus meetup location!
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="flex flex-col space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-800">{m.sender.name}</span>
                  <span className="text-[10px] text-slate-400">({m.sender.studentId || 'IIIT-NR'})</span>
                  <span>•</span>
                  <span>{formatCustomDate(m.createdAt)}</span>
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-xl rounded-tl-xs text-xs text-slate-800 shadow-2xs leading-relaxed max-w-[85%] self-start whitespace-pre-wrap">
                  {m.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type message (e.g., 'Meet near Raman reception at 5 PM')..."
            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
