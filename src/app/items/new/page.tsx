'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Image as ImageIcon, MapPin, AlertCircle, Sparkles } from 'lucide-react';
import { CATEGORIES, ITEM_CONDITIONS, CAMPUS_LOCATIONS } from '@/lib/utils';

const PRESET_IMAGES = [
  { name: 'Calculator', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80' },
  { name: 'Arduino / IoT', url: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600&auto=format&fit=crop&q=80' },
  { name: 'Laptop Charger', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80' },
  { name: 'Sports Gear', url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80' },
  { name: 'Textbook', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80' },
  { name: 'Bicycle', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80' },
  { name: 'HDMI Cable', url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80' },
  { name: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80' },
];

export default function NewItemPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Academic Equipment');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string>(PRESET_IMAGES[0].url);
  const [condition, setCondition] = useState<string>('Good');
  const [mode, setMode] = useState<string>('BORROW');
  const [rentalPrice, setRentalPrice] = useState('');
  const [declaredValue, setDeclaredValue] = useState('1000');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [maxDuration, setMaxDuration] = useState('7');
  const [campusLocation, setCampusLocation] = useState<string>(CAMPUS_LOCATIONS[0]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category || !description.trim()) {
      setError('Please provide item name, category, and description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          description: description.trim(),
          imageUrl: imageUrl.trim(),
          condition,
          mode,
          rentalPrice: rentalPrice ? parseFloat(rentalPrice) : null,
          declaredValue: declaredValue ? parseFloat(declaredValue) : 1000,
          securityDeposit: securityDeposit ? parseFloat(securityDeposit) : null,
          maxDuration: parseInt(maxDuration) || 7,
          campusLocation,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to list item');
      }

      router.push(`/items/${data.item.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="bg-white p-6 sm:p-10 rounded-4xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5">
          <div className="p-3 bg-mint-100 text-teal-700 rounded-2xl">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
              BorrowBuddy Listing
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">List an Item on Campus</h1>
            <p className="text-xs text-slate-500">
              Share physical equipment with verified students across Ramanujan &amp; Bose hostels.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Casio Scientific Calculator FX-991ES"
                className="w-full text-xs p-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description &amp; Accessories Included *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the item condition, included cables/cases, key features, or ideal course use..."
              className="w-full text-xs p-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Condition & Campus Handover Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Physical Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full text-xs p-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              >
                {ITEM_CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Campus Meetup / Handover Spot
              </label>
              <select
                value={campusLocation}
                onChange={(e) => setCampusLocation(e.target.value)}
                className="w-full text-xs p-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mode & Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Borrow / Rent Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full text-xs p-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white font-bold text-teal-800"
              >
                <option value="BORROW">Free Borrowing</option>
                <option value="RENT">Rental</option>
                <option value="BOTH">Borrow or Rent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rental Price (₹ / day) {mode === 'BORROW' && '(N/A)'}
              </label>
              <input
                type="number"
                disabled={mode === 'BORROW'}
                value={rentalPrice}
                onChange={(e) => setRentalPrice(e.target.value)}
                placeholder="e.g. 20"
                className="w-full text-xs p-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Max Borrow Duration (Days)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                required
                value={maxDuration}
                onChange={(e) => setMaxDuration(e.target.value)}
                placeholder="7"
                className="w-full text-xs p-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* Declared Base Value for Overdue Penalty Rule */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Declared Item Replacement Value (₹)
              </label>
              <span className="text-[11px] text-teal-800 font-bold bg-mint-100 px-2.5 py-0.5 rounded-full">
                Penalty: 5% / overdue day (₹{((parseFloat(declaredValue) || 0) * 0.05).toFixed(0)}/day)
              </span>
            </div>
            <input
              type="number"
              min={100}
              required
              value={declaredValue}
              onChange={(e) => setDeclaredValue(e.target.value)}
              placeholder="1000"
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            />
            <p className="text-[11px] text-slate-500">
              This declared value serves as the base for BorrowBuddy&apos;s simulated 5% per day overdue penalty calculation.
            </p>
          </div>

          {/* Image Presets & Custom URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Item Photo (Click a preset or enter URL)</span>
              <span className="text-teal-700 font-semibold">Quick presets</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-2">
              {PRESET_IMAGES.map((img) => (
                <button
                  type="button"
                  key={img.name}
                  onClick={() => setImageUrl(img.url)}
                  className={`relative rounded-xl overflow-hidden h-14 border-2 transition ${
                    imageUrl === img.url ? 'border-teal-600 scale-95 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                  title={img.name}
                >
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] text-white truncate px-1 py-0.5 text-center">
                    {img.name}
                  </span>
                </button>
              ))}
            </div>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50 font-mono"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-full transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3 bg-teal-600 hover:bg-teal-700 active:scale-98 disabled:bg-slate-300 text-white font-bold text-xs rounded-full shadow-md shadow-teal-700/20 transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loading ? 'Publishing Listing...' : 'Publish Item Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
