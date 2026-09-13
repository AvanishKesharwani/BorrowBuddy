import { format, formatDistanceToNow, isPast } from 'date-fns';

export const CATEGORIES = [
  'All',
  'Textbooks & Academics',
  'Electronics & Tech',
  'Outdoor & Sports',
  'Project & Lab Equipment',
  'Daily-use Items',
  'Other',
] as const;

export const ITEM_CONDITIONS = ['Brand New', 'Like New', 'Good', 'Fair'] as const;

export const CAMPUS_LOCATIONS = [
  'Hostel Raman (Boys)',
  'Hostel Shabri (Girls)',
  'Central Library',
  'Sports Complex',
  'Student Activity Centre (SAC)',
  'IoT & Robotics Lab',
  'Electronics Hardware Lab',
  'Academic Building (LT-1 / LT-2)',
  'Dining Hall / Cafeteria',
  'Campus Main Gate',
] as const;

export const BRANCHES = ['DSAI', 'CSE', 'ECE', 'Other'] as const;
export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'M.Tech', 'Ph.D.'] as const;

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCustomDate(date: Date | string): string {
  const d = new Date(date);
  return format(d, 'dd MMM yyyy, h:mm a');
}

export function formatShortDate(date: Date | string): string {
  const d = new Date(date);
  return format(d, 'dd MMM yyyy');
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  return formatDistanceToNow(d, { addSuffix: true });
}

export function getStatusBadgeStyle(status: string): { bg: string; text: string; border: string } {
  switch (status.toUpperCase()) {
    case 'AVAILABLE':
      return { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' };
    case 'BORROWED':
    case 'ACTIVE':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'REQUESTED':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' };
    case 'RETURN_PENDING':
      return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    case 'RETURNED':
      return { bg: 'bg-teal-100', text: 'text-teal-900', border: 'border-teal-300' };
    case 'OVERDUE':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    case 'DISPUTED':
      return { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' };
    case 'REJECTED':
    case 'CANCELLED':
      return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
  }
}
