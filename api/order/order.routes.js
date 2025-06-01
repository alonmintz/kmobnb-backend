import express from 'express'
import { log } from '../../middlewares/logger.middleware.js'
import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { addOrder, getOrder, getHostOrders, updateOrderStatus } from './order.controller.js'

const router = express.Router()

router.use(log)

router.get("/", requireAuth, getHostOrders)
router.get("/:orderId", requireAuth, getOrder)
router.post("/", requireAuth, addOrder)
// router.put("/:orderId", requireAuth, updateOrderStatus)

export const orderRouter = router