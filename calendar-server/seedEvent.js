// server/scripts/seedEvents.js
const mongoose = require("mongoose");
const Event = require("./models/Event"); // 导入事件模型

// 连接数据库
mongoose.connect("mongodb://127.0.0.1:27017/calendarApp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "连接错误："));
db.once("open", async () => {
  console.log("✅ 数据库已连接，开始写入测试数据...");

  await Event.deleteMany({}); // 清空旧数据

  const events = [
    // ==== 9 月份 ====
    {
      title: "团队周会",
      description: "讨论项目进度与下周任务",
      startTime: new Date("2025-09-03T10:00:00"),
      endTime: new Date("2025-09-03T11:00:00"),
      location: "会议室 A1",
      reminder: "30m",
      calendarType: "work",
    },
    {
      title: "前端开发培训",
      description: "学习 Vue3 + TypeScript 实战",
      startTime: new Date("2025-09-10T14:00:00"),
      endTime: new Date("2025-09-10T16:00:00"),
      location: "线上 Zoom",
      reminder: "1h",
      calendarType: "personal",
    },
    {
      title: "客户会议",
      description: "演示新功能",
      startTime: new Date("2025-09-18T09:30:00"),
      endTime: new Date("2025-09-18T11:30:00"),
      location: "客户公司总部",
      reminder: "1d",
      calendarType: "work",
    },

    // ==== 10 月份 ====
    {
      title: "国庆出游",
      description: "和家人一起去云南旅行",
      startTime: new Date("2025-10-01T08:00:00"),
      endTime: new Date("2025-10-07T20:00:00"),
      location: "云南",
      reminder: "1d",
      calendarType: "personal",
    },
    {
      title: "项目评审会议",
      description: "汇报项目阶段成果",
      startTime: new Date("2025-10-10T09:00:00"),
      endTime: new Date("2025-10-10T11:00:00"),
      location: "会议室 B2",
      reminder: "30m",
      calendarType: "work",
    },
    {
      title: "代码重构",
      description: "优化音乐播放器项目结构",
      startTime: new Date("2025-10-15T13:00:00"),
      endTime: new Date("2025-10-15T18:00:00"),
      location: "远程办公",
      reminder: "15m",
      calendarType: "work",
    },
    {
      title: "健身训练",
      description: "力量训练 + 有氧跑步",
      startTime: new Date("2025-10-22T18:30:00"),
      endTime: new Date("2025-10-22T20:00:00"),
      location: "健身房",
      reminder: "10m",
      calendarType: "personal",
    },

    // ==== 11 月份 ====
    {
      title: "期中考试",
      description: "离散数学 + 数据结构",
      startTime: new Date("2025-11-05T09:00:00"),
      endTime: new Date("2025-11-05T12:00:00"),
      location: "教学楼 B203",
      reminder: "1d",
      calendarType: "personal",
    },
    {
      title: "技术分享会",
      description: "分享前端性能优化经验",
      startTime: new Date("2025-11-12T15:00:00"),
      endTime: new Date("2025-11-12T17:00:00"),
      location: "会议室 C1",
      reminder: "1h",
      calendarType: "work",
    },
    {
      title: "朋友聚会",
      description: "老同学聚餐",
      startTime: new Date("2025-11-23T19:00:00"),
      endTime: new Date("2025-11-23T22:00:00"),
      location: "市中心餐厅",
      reminder: "2h",
      calendarType: "personal",
    },
  ];

  await Event.insertMany(events);

  console.log(`🎉 成功写入 ${events.length} 条事件数据！`);
  mongoose.connection.close();
});
