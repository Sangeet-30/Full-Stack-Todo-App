/**
 * Date utilities for calendar date handling without timezone shifts.
 * Treats dates strictly as calendar days (YYYY-MM-DD), avoiding UTC conversion bugs.
 */

/**
 * Returns today's calendar date in local time as 'YYYY-MM-DD'.
 */
export const getTodayDateString = (now = new Date()) => {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Extracts a normalized 'YYYY-MM-DD' calendar date string from:
 * - A 'YYYY-MM-DD' string
 * - A UTC midnight ISO string (e.g. '2026-10-21T00:00:00.000Z')
 * - A timestamp with timezone offset (e.g. '2026-10-20T18:30:00.000Z')
 * - A JavaScript Date object
 */
export const extractCalendarDate = (dateVal) => {
  if (!dateVal) return "";

  if (typeof dateVal === "string") {
    const trimmed = dateVal.trim();
    const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!ymdMatch) return "";

    // If it's a date-only string or UTC midnight ISO string, take the calendar date directly
    if (trimmed.length === 10 || trimmed.includes("T00:00:00")) {
      return `${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`;
    }

    // If it's an ISO timestamp with non-zero time (such as legacy local midnight stored as UTC)
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const day = String(parsed.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    return `${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`;
  }

  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    // If UTC midnight Date
    if (dateVal.getUTCHours() === 0 && dateVal.getUTCMinutes() === 0) {
      const year = dateVal.getUTCFullYear();
      const month = String(dateVal.getUTCMonth() + 1).padStart(2, "0");
      const day = String(dateVal.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    // Local date fallback
    const year = dateVal.getFullYear();
    const month = String(dateVal.getMonth() + 1).padStart(2, "0");
    const day = String(dateVal.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return "";
};

/**
 * Calculates the exact integer day difference between two calendar dates (cleanDue - cleanBase).
 * Uses UTC noon timestamps to completely avoid DST shifts and hour/minute rounding errors.
 */
export const calculateCalendarDayDiff = (
  dueDateStr,
  baseDateStr = getTodayDateString(),
) => {
  const cleanDue = extractCalendarDate(dueDateStr);
  const cleanBase = extractCalendarDate(baseDateStr);

  if (!cleanDue || !cleanBase) return null;

  const [y1, m1, d1] = cleanBase.split("-").map(Number);
  const [y2, m2, d2] = cleanDue.split("-").map(Number);

  const utcBase = Date.UTC(y1, m1 - 1, d1, 12, 0, 0);
  const utcDue = Date.UTC(y2, m2 - 1, d2, 12, 0, 0);

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((utcDue - utcBase) / MS_PER_DAY);
};

/**
 * Validates whether a date string is today or in the future based on local calendar dates.
 */
export const isDateTodayOrFuture = (
  dateStr,
  baseDateStr = getTodayDateString(),
) => {
  const cleanDate = extractCalendarDate(dateStr);
  const cleanBase = extractCalendarDate(baseDateStr);
  if (!cleanDate || !cleanBase) return false;
  return cleanDate >= cleanBase;
};

/**
 * Determines the display badge label, status, and styling for a task due date.
 */
export const getDueDateStatus = (
  dueDateStr,
  completed = false,
  baseDateStr = getTodayDateString(),
) => {
  const cleanDate = extractCalendarDate(dueDateStr);
  if (!cleanDate) return null;

  if (completed) {
    return {
      label: `Completed · ${cleanDate}`,
      status: "completed",
      badgeClass: "bg-slate-100 text-slate-400 border-slate-200",
      diffDays: null,
    };
  }

  const diffDays = calculateCalendarDayDiff(cleanDate, baseDateStr);
  if (diffDays === null) return null;

  if (diffDays < 0) {
    return {
      label: `Overdue (${cleanDate})`,
      status: "overdue",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200 font-medium",
      diffDays,
    };
  }

  if (diffDays === 0) {
    return {
      label: "Due today",
      status: "today",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200 font-medium",
      diffDays: 0,
    };
  }

  if (diffDays === 1) {
    return {
      label: "Due tomorrow",
      status: "tomorrow",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      diffDays: 1,
    };
  }

  return {
    label: `Due in ${diffDays} days (${cleanDate})`,
    status: "upcoming",
    badgeClass: "bg-slate-50 text-slate-600 border-slate-200",
    diffDays,
  };
};

/**
 * Determines whether a task can enter or remain in edit mode.
 * Completed tasks cannot be edited; only active/incomplete tasks are editable.
 */
export const canEditTask = (completed) => {
  return !completed;
};
