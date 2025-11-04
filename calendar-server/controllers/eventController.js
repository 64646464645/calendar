const Event = require('../models/Event')

// ✅ 获取所有日程（支持日期区间查询）
exports.getEvents = async (req, res) => {
  try {
    const { start, end } = req.query
    const query = {}

    if (start && end) {
      query.startTime = { $gte: new Date(start), $lte: new Date(end) }
    }

    const events = await Event.find(query).sort({ startTime: 1 })
    res.status(200).json({ code: 200, message: 'OK', data: events })
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message })
  }
}

// ✅ 获取单个日程
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event)
      return res.status(404).json({ code: 404, message: 'Event not found' })

    res.status(200).json({ code: 200, message: 'OK', data: event })
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message })
  }
}

// ✅ 创建日程
exports.createEvent = async (req, res) => {
  try {
    const newEvent = new Event(req.body)
    const saved = await newEvent.save()
    res.status(201).json({ code: 200, message: 'Created', data: saved })
  } catch (err) {
    res.status(400).json({ code: 400, message: err.message })
  }
}

// ✅ 更新日程
exports.updateEvent = async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    if (!updated)
      return res.status(404).json({ code: 404, message: 'Event not found' })

    res.status(200).json({ code: 200, message: 'Updated', data: updated })
  } catch (err) {
    res.status(400).json({ code: 400, message: err.message })
  }
}

// ✅ 删除日程
exports.deleteEvent = async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id)
    if (!deleted)
      return res.status(404).json({ code: 404, message: 'Event not found' })

    res.status(200).json({ code: 200, message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message })
  }
}
