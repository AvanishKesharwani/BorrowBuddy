/**
 * ============================================================================
 * POST-TRANSACTION PEER RATING MODAL (src/components/RatingModal.tsx)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * An interactive feedback dialog presented when an item is returned:
 * 1. Interactive 5-star selector with hover previews and dynamic descriptions
 *    (e.g., "5.0 — Outstanding & Reliable!").
 * 2. Multi-select campus feedback tags ("Returned On-Time", "Pristine Condition",
 *    "Polite & Respectful").
 * 3. Textual review comment input.
 * 4. Dispatches the review payload to `/api/ratings`, automatically refreshing
 *    the peer's campus trust score.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Interactive State Management: Handles hover state (`hoverRating`) vs locked
 *    rating (`rating`) for smooth star highlighting.
 * 2. Campus Reputation Building: Feeds directly into student trust profiles,
 *    fostering respectful and responsible peer-to-peer exchanges.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this is our peer feedback modal. When a loan concludes, students use
 * this dialog to rate each other out of 5 stars and select feedback tags. It directly
 * recalculates the peer's campus reputation score."
 * ============================================================================
 */

'use client';

import React, { useState } from 'react';
import { X, Star, CheckCircle, ThumbsUp } from 'lucide-react';

interface RatingModalProps {
  transactionId: string;
  itemTitle: string;
  revieweeName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Preset campus feedback criteria tags
const CRITERIA_OPTIONS = [
  'Returned On-Time',
  'Mint / Pristine Condition',
  'Prompt Handover',
  'Polite & Respectful',
  'Clear Communication',
  'Highly Recommended',
];

export default function RatingModal({
  transactionId,
  itemTitle,
  revieweeName,
  isOpen,
  onClose,
  onSuccess,
}: RatingModalProps) {
  // Local state for star rating, hover preview, criteria tags, and review text
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>(['Returned On-Time', 'Clear Communication']);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Toggle selection for feedback criteria tags
  const toggleCriteria = (item: string) => {
    if (selectedCriteria.includes(item)) {
      setSelectedCriteria(selectedCriteria.filter((c) => c !== item));
    } else {
      setSelectedCriteria([...selectedCriteria, item]);
    }
  };

  /**
   * --------------------------------------------------------------------------
   * handleSubmit():
   * Posts rating to `/api/ratings` and triggers success callback.
   * --------------------------------------------------------------------------
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          rating,
          comment: comment.trim(),
          criteria: selectedCriteria.join(', '),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit rating');
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
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Rate Your Experience</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Transaction for: {itemTitle}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Interactive Star Rating Selector */}
          <div className="text-center py-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              How would you rate your peer, <span className="text-teal-600 dark:text-teal-400">{revieweeName}</span>?
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
              {rating === 5
                ? '5.0 — Outstanding & Reliable!'
                : rating === 4
                ? '4.0 — Very Good Experience'
                : rating === 3
                ? '3.0 — Average'
                : 'Needs Improvement'}
            </p>
          </div>

          {/* Quick criteria tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select feedback tags:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CRITERIA_OPTIONS.map((crit) => {
                const isSelected = selectedCriteria.includes(crit);
                return (
                  <button
                    type="button"
                    key={crit}
                    onClick={() => toggleCriteria(crit)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                      isSelected
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {crit}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review comment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Public Comment / Testimonial:
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. 'Very prompt in meeting up outside Raman hostel. Item was in great condition!'"
              className="w-full text-xs p-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          {/* Submit Actions */}
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
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 rounded-xl shadow-xs transition"
            >
              {loading ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
