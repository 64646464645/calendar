"use strict";
let reminderTimers = [];
function scheduleReminders(events) {
  reminderTimers.forEach((timer) => clearInterval(timer));
  reminderTimers = [];
}
function scheduleSingleReminder(event) {
  if (event._id)
    scheduleReminders();
}
exports.scheduleReminders = scheduleReminders;
exports.scheduleSingleReminder = scheduleSingleReminder;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/reminder.js.map
