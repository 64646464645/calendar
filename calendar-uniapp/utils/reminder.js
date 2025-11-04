// 由于uniapp中没有浏览器的setTimeout功能，我们简化提醒功能
// 在真实应用中，应该由服务端处理提醒功能

let reminderTimers = [];

function unitToMs(unit) {
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 }; // 添加秒支持用于测试
  return units[unit] || 60000; // 默认为分钟
}

// 在uniapp中，提醒功能会有所简化，主要用于演示
export function scheduleReminders(events) {
  // 清除之前的定时器
  reminderTimers.forEach(timer => clearTimeout(timer));
  reminderTimers = [];

  console.log('设置提醒，事件数量:', events.length);

  const now = Date.now();
  events.forEach(event => {
    if (!event.reminder || !event._id) {
      console.log('跳过事件（缺少提醒信息）:', event.title);
      return;
    }

    const start = new Date(event.startTime).getTime();
    const delay = start - event.reminder.value * unitToMs(event.reminder.unit) - now;

    console.log(`事件 "${event.title}" 的提醒设置:`, {
      startTime: event.startTime,
      start,
      reminderValue: event.reminder.value,
      reminderUnit: event.reminder.unit,
      now: new Date(now).toISOString(),
      delay,
      willTrigger: delay > 0
    });

    if (delay > 0) {
      console.log(`将在 ${delay} 毫秒后触发提醒`);
      const timer = setTimeout(() => {
        console.log('触发提醒:', event.title);
        uni.showToast({
          title: `【提醒】${event.title} 即将开始`,
          icon: 'none',
          duration: 5000
        });
      }, delay);
      reminderTimers.push(timer);
    } else {
      console.log('跳过事件（提醒时间已过）:', event.title, '延迟:', delay);
    }
  });

}

export function scheduleSingleReminder(event) {
  console.log('设置单个事件提醒:', event);
  if (event && event._id) {
    scheduleReminders([event]);
  } else {
    console.log('无法设置提醒：事件数据不完整');
  }
}

export function cancelReminder(eventId) {
  // 简化处理
  console.log('取消提醒:', eventId);
}

export function clearAllReminders() {
  reminderTimers.forEach(timer => clearTimeout(timer));
  reminderTimers = [];
  console.log('清除所有提醒');
}