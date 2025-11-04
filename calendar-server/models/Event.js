const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true }, // 标题（必填）
  description: String,                     // 事件描述
  startTime: { type: Date, required: true },// 开始时间
  endTime: { type: Date, required: true },  // 结束时间
  location: String,                         // 地点
  reminder: {
    value: { type: Number, required: true },
    unit: { type: String, enum: ['m', 'h', 'd'], required: true }
  },
  calendarType: { type: String, default: 'personal' }, // 日历类型（比如 personal/work）
  createdAt: { type: Date, default: Date.now }         // 创建时间
});

module.exports = mongoose.model('Event', eventSchema);
