/**
 * ============================================================================
 * GENERAL CAMPUS UTILITIES & FORMATTING (src/lib/utils.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Provides central constants (campus locations, departments, years, item
 * categories) and reusable helper functions for formatting Indian Rupee currency
 * (₹), human-readable dates, relative time intervals, and color-coded status badges.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Single Source of Truth: Centralizing campus constants ensures that
 *    dropdown options in forms (like Registration or Create Listing) match the
 *    database schema constraints.
 * 2. Internationalization: `Intl.NumberFormat('en-IN')` guarantees accurate
 *    Indian currency formatting (e.g. ₹1,500 without decimals).
 * 3. Consistent UI Badges: Standardizes Tailwind CSS styling for transaction
 *    statuses (AVAILABLE, ACTIVE, OVERDUE, DISPUTED, etc.).
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this file contains our helper functions and campus configuration.
 * It provides standardized drop-down options for IIIT-NR hostels and labs,
 * formats prices in Indian Rupees (₹), and converts timestamps into friendly
 * text like '2 hours ago'."
 * ============================================================================
 */

import { format, formatDistanceToNow, isPast } from 'date-fns';

/**
 * ----------------------------------------------------------------------------
 * CAMPUS CATEGORIES & ENUMS
 * Standardized categories for peer-to-peer item classification.
 * ----------------------------------------------------------------------------
 */
export const CATEGORIES = [
  'All',
  'Textbooks & Academics',
  'Electronics & Tech',
  'Outdoor & Sports',
  'Project & Lab Equipment',
  'Daily-use Items',
  'Other',
] as const;

// Physical condition grading for listed equipment
export const ITEM_CONDITIONS = ['Brand New', 'Like New', 'Good', 'Fair'] as const;

// Verified campus handover locations at IIIT-NR
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

// Academic branches & degrees
export const BRANCHES = ['DSAI', 'CSE', 'ECE', 'Other'] as const;
export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'M.Tech', 'Ph.D.'] as const;

/**
 * ----------------------------------------------------------------------------
 * formatINR(amount):
 * Formats a number into Indian Rupee currency format (e.g., 50 -> ₹50).
 * ----------------------------------------------------------------------------
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * ----------------------------------------------------------------------------
 * formatCustomDate(date):
 * Converts a Date object or ISO string to format: "01 Oct 2026, 9:30 AM".
 * ----------------------------------------------------------------------------
 */
export function formatCustomDate(date: Date | string): string {
  const d = new Date(date);
  return format(d, 'dd MMM yyyy, h:mm a');
}

/**
 * ----------------------------------------------------------------------------
 * formatShortDate(date):
 * Converts a Date object or ISO string to format: "01 Oct 2026".
 * ----------------------------------------------------------------------------
 */
export function formatShortDate(date: Date | string): string {
  const d = new Date(date);
  return format(d, 'dd MMM yyyy');
}

/**
 * ----------------------------------------------------------------------------
 * formatRelativeTime(date):
 * Returns human-readable relative time (e.g. "5 minutes ago", "in 2 days").
 * ----------------------------------------------------------------------------
 */
export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * ----------------------------------------------------------------------------
 * getStatusBadgeStyle(status):
 * Maps transaction and item availability statuses to Tailwind CSS styles
 * (background, text color, and border) for clean visual badges.
 * ----------------------------------------------------------------------------
 */
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
