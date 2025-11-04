const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const eventRoutes = require('./routes/eventRoutes')

const app = express()
connectDB()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.send('📅 Calendar API 正在运行...'))
app.use('/api/events', eventRoutes)

const PORT = 3000
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
