/* ------------------------ ⏱️ 辅助函数 ------------------------ */
export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

// 获取某月第一天
export function getFirstDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// 获取某月最后一天
export function getLastDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

// 获取某天的开始时间
export function getStartOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// 获取某天的结束时间
export function getEndOfDay(date) {
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  end.setDate(end.getDate() + 1);
  return end;
}

// 判断两个日期是否同一天
export function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// 判断是否是今天
export function isToday(date) {
  return isSameDay(date, new Date());
}

// 格式化日期为 YYYY-MM-DD
export function formatToDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 获取月份的所有日期
export function getMonthDays(date) {
  const firstDay = getFirstDayOfMonth(date);
  const lastDay = getLastDayOfMonth(date);

  // 从周日开始计算
  const startDay = new Date(firstDay);
  startDay.setDate(firstDay.getDate() - firstDay.getDay());

  // 确保能显示6行完整的日期
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

// 获取一周的日期
export function getWeekDays(date) {
  const week = [];
  const startDate = new Date(date);
  startDate.setDate(date.getDate() - date.getDay()); // 回到周日

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    week.push(currentDate);
  }

  return week;
}