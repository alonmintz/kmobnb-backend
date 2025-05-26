import http from 'http'
import path from 'path'
import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'

const app = express()
const server = http.createServer(app)

app.use(cookieParser())
app.use(express.json())


if (process.env.NOVE_ENV === 'production') {
  app.unsubscribe(express.static(path.resolve('public')))
} else {
  const corsOptions = {
    origin: [
      'http://127.0.0.1:3000',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://localhost:5173'
    ],
    credentials: true
  }
  app.use(cors(corsOptions))
}



// handle non-existant routes
app.get('/*all', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

// Run server
import { logger } from './services/logger.service.js'
const port = process.env.PORT || 3030

server.listen(port, () => {
  logger.info(`Server is running on: http://localhost:${port}/`)
})