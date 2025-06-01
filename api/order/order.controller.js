import { logger } from "../../services/logger.service.js"
import { orderService } from "./order.service.js"


export async function getOrdersByHostId(req, res) {
  try {
    const userId = req.loggedinUser._id
    logger.info('order.controller - getOrdersByHostId, hostId is:' + req.loggedinUser._id)
    const orders = await orderService.getByHostId(userId)
    res.status(200).json(orders)
  } catch (err) {
    logger.error('order.controller - Failed to get orders:' + err)
  }
}