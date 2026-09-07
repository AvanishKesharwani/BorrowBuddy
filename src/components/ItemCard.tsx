import React from 'react';
import { Star, MapPin, Clock, ShieldCheck, Tag } from 'lucide-react';
import { formatINR, getStatusBadgeStyle } from '@/lib/utils';

interface ItemCardProps {
  item: {
    id: string;
    name: string;
    category: string;
    description: string;
    imageUrl: string;
    condition: string;
    mode: string;
    rentalPrice: number | null;
    declaredValue: number;
    maxDuration: number;
    availability: string;
    campusLocation: string;
    owner: {
      id: string;
      studentId: string;
      name: string;
      branch: string;
      year: string;
      avatarUrl: string;
      rating: number;
      reliabilityScore: number;
    };
  };
}

export default function ItemCard({ item }: ItemCardProps) {
  const badgeStyle = getStatusBadgeStyle(item.availability);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col group">
      {/* Image Container */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        {/* Availability Badge */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
          >
            {item.availability}
          </span>
          <span className="bg-slate-900/80 backdrop-blur-xs text-white text-xs font-medium px-2 py-0.5 rounded-full">
            {item.condition}
          </span>
        </div>

        {/* Mode & Price Badge */}
        <div className="absolute bottom-3 right-3">
          {item.mode === 'RENT' ? (
            <span className="bg-amber-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
              Rent: {formatINR(item.rentalPrice || 0)}/day
            </span>
          ) : item.mode === 'BOTH' ? (
            <span className="bg-blue-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
              Borrow or Rent: {formatINR(item.rentalPrice || 0)}/d
            </span>
          ) : (
            <span className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
              Free Borrow
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Tag className="w-3 h-3" />
            <span>{item.category}</span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-blue-600 transition">
            {item.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
          {/* Duration & Location details */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Max {item.maxDuration} days
            </span>
            <span className="flex items-center gap-1 text-slate-600 truncate max-w-[170px]" title={item.campusLocation}>
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">{item.campusLocation}</span>
            </span>
          </div>

          {/* Owner Info & Action */}
          <div className="flex items-center justify-between pt-1">
            <a
              href={`/profile/${item.owner.id}`}
              className="flex items-center gap-2 group/owner hover:opacity-85"
            >
              <img
                src={item.owner.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={item.owner.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
              />
              <div>
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {item.owner.name.split(' ')[0]}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <span className="flex items-center text-amber-500 font-bold">
                    <Star className="w-2.5 h-2.5 fill-amber-400 mr-0.5" />
                    {item.owner.rating.toFixed(1)}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-medium">
                    {item.owner.reliabilityScore.toFixed(0)}% trust
                  </span>
                </div>
              </div>
            </a>

            <a
              href={`/items/${item.id}`}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                item.availability === 'AVAILABLE'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none'
              }`}
            >
              {item.availability === 'AVAILABLE' ? 'Borrow Item' : 'Borrowed'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
