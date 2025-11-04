const express = require('express')
const router = express.Router()
const eventController = require('../controllers/eventController')

// 路由映射
router.get('/', eventController.getEvents)          // 获取全部或区间内的事件
router.get('/:id', eventController.getEventById)    // 获取单个事件
router.post('/', eventController.createEvent)       // 新增事件
router.put('/:id', eventController.updateEvent)     // 修改事件
router.delete('/:id', eventController.deleteEvent)  // 删除事件

module.exports = router
