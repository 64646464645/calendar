"use strict";
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}
function getFirstDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function getLastDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
function getStartOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function getEndOfDay(date) {
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  end.setDate(end.getDate() + 1);
  return end;
}
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
}
function isToday(date) {
  return isSameDay(date, /* @__PURE__ */ new Date());
}
function getMonthDays(date) {
  const firstDay = getFirstDayOfMonth(date);
  getLastDayOfMonth(date);
  const startDay = new Date(firstDay);
  startDay.setDate(firstDay.getDate() - firstDay.getDay());
  const endDate = new Date(startDay);
  endDate.setDate(startDay.getDate() + 42);
  const days = [];
  const current = new Date(startDay);
  while (current < endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}
function getWeekDays(date) {
  const week = [];
  const startDate = new Date(date);
  startDate.setDate(date.getDate() - date.getDay());
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    week.push(currentDate);
  }
  return week;
}
exports.formatDate = formatDate;
exports.getEndOfDay = getEndOfDay;
exports.getFirstDayOfMonth = getFirstDayOfMonth;
exports.getLastDayOfMonth = getLastDayOfMonth;
exports.getMonthDays = getMonthDays;
exports.getStartOfDay = getStartOfDay;
exports.getWeekDays = getWeekDays;
exports.isToday = isToday;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/date.js.map
