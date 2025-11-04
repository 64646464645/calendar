const mongoose = require('mongoose')

async function connectDB() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/calendarApp')
    console.log('MongoDB 连接成功')
  } catch (err) {
    console.error('数据库连接失败:', err.message)
    process.exit(1)
  }
}

module.exports = connectDB
