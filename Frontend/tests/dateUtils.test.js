import test from "node:test";
import assert from "node:assert/strict";
import {
  extractCalendarDate,
  calculateCalendarDayDiff,
  isDateTodayOrFuture,
  getDueDateStatus,
  getTodayDateString,
  canEditTask,
} from "../src/utils/dateUtils.js";

test("getTodayDateString returns YYYY-MM-DD format", () => {
  const todayStr = getTodayDateString();
  assert.match(todayStr, /^\d{4}-\d{2}-\d{2}$/);
});

test("extractCalendarDate extracts YYYY-MM-DD from plain date strings", () => {
  assert.equal(extractCalendarDate("2026-10-21"), "2026-10-21");
  assert.equal(extractCalendarDate("2026-01-05"), "2026-01-05");
});

test("extractCalendarDate extracts calendar date from MongoDB UTC midnight ISO timestamps", () => {
  assert.equal(extractCalendarDate("2026-10-21T00:00:00.000Z"), "2026-10-21");
  assert.equal(extractCalendarDate("2026-12-31T00:00:00.000Z"), "2026-12-31");
});

test("extractCalendarDate handles Date objects", () => {
  const utcDate = new Date(Date.UTC(2026, 9, 25, 0, 0, 0));
  assert.equal(extractCalendarDate(utcDate), "2026-10-25");
});

test("calculateCalendarDayDiff computes exact calendar days without timezone shifts", () => {
  assert.equal(calculateCalendarDayDiff("2026-10-21", "2026-10-21"), 0);
  assert.equal(calculateCalendarDayDiff("2026-10-22", "2026-10-21"), 1);
  assert.equal(calculateCalendarDayDiff("2026-10-20", "2026-10-21"), -1);
  assert.equal(calculateCalendarDayDiff("2026-10-23", "2026-10-21"), 2);
  assert.equal(calculateCalendarDayDiff("2026-11-01", "2026-10-31"), 1);
  assert.equal(calculateCalendarDayDiff("2027-01-01", "2026-12-31"), 1);
  assert.equal(calculateCalendarDayDiff("2024-03-01", "2024-02-28"), 2); // Leap year 2024
});

test("Status Label: Selected date is Today -> 'Due today'", () => {
  const result = getDueDateStatus("2026-10-21", false, "2026-10-21");
  assert.equal(result.status, "today");
  assert.equal(result.label, "Due today");
  assert.equal(result.diffDays, 0);
});

test("Status Label: Selected date is Tomorrow -> 'Due tomorrow'", () => {
  const result = getDueDateStatus("2026-10-22", false, "2026-10-21");
  assert.equal(result.status, "tomorrow");
  assert.equal(result.label, "Due tomorrow");
  assert.equal(result.diffDays, 1);
});

test("Status Label: Selected date is Yesterday -> 'Overdue'", () => {
  const result = getDueDateStatus("2026-10-20", false, "2026-10-21");
  assert.equal(result.status, "overdue");
  assert.match(result.label, /^Overdue/);
  assert.equal(result.diffDays, -1);
});

test("Status Label: Selected date is Two days in the future -> 'Due in 2 days'", () => {
  const result = getDueDateStatus("2026-10-23", false, "2026-10-21");
  assert.equal(result.status, "upcoming");
  assert.match(result.label, /^Due in 2 days/);
  assert.equal(result.diffDays, 2);
});

test("Status Label: Dates received from MongoDB as ISO timestamps", () => {
  // Today from DB
  const todayResult = getDueDateStatus(
    "2026-10-21T00:00:00.000Z",
    false,
    "2026-10-21",
  );
  assert.equal(todayResult.status, "today");
  assert.equal(todayResult.label, "Due today");

  // Tomorrow from DB
  const tomorrowResult = getDueDateStatus(
    "2026-10-22T00:00:00.000Z",
    false,
    "2026-10-21",
  );
  assert.equal(tomorrowResult.status, "tomorrow");
  assert.equal(tomorrowResult.label, "Due tomorrow");

  // Yesterday from DB
  const yesterdayResult = getDueDateStatus(
    "2026-10-20T00:00:00.000Z",
    false,
    "2026-10-21",
  );
  assert.equal(yesterdayResult.status, "overdue");
  assert.match(yesterdayResult.label, /^Overdue/);
});

test("Status Label: Completed tasks display completed label", () => {
  const result = getDueDateStatus("2026-10-21", true, "2026-10-21");
  assert.equal(result.status, "completed");
  assert.equal(result.label, "Completed · 2026-10-21");
});

test("isDateTodayOrFuture correctly evaluates dates", () => {
  assert.equal(isDateTodayOrFuture("2026-10-21", "2026-10-21"), true);
  assert.equal(isDateTodayOrFuture("2026-10-22", "2026-10-21"), true);
  assert.equal(isDateTodayOrFuture("2026-10-20", "2026-10-21"), false);
});

test("Task Editability: Active task can enter edit mode", () => {
  const completed = false;
  assert.equal(canEditTask(completed), true);
});

test("Task Editability: Completed task cannot enter edit mode", () => {
  const completed = true;
  assert.equal(canEditTask(completed), false);
});

test("Task Editability: Marking completed task incomplete restores editability", () => {
  let completed = true;
  assert.equal(canEditTask(completed), false);

  // Toggle to incomplete
  completed = false;
  assert.equal(canEditTask(completed), true);
});
