import express from 'express'
import { log } from '../../middlewares/logger.middleware.js'
import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { getOrdersByHostId } from './order.controller.js'

const router = express.Router()

router.use(log)

router.get("/", requireAuth, getOrdersByHostId)
// router.post("/", requireAuth, addOrder)


export const orderRouter = router