import { logger } from "../../services/logger.service.js"
import { orderService } from "./order.service.js"


export async function getHostOrders(req, res) {
  try {
    const userId = req.loggedinUser._id
    const stayId = req.query.stayId
    logger.info('order.controller - getOrdersByHostId, hostId is:' + req.loggedinUser._id)
    const orders = await orderService.getHostOrders(userId, stayId)
    res.status(200).json(orders)
  } catch (err) {
    logger.error('order.controller - Failed to getHostOrders:' + err)
    res.status(500).send({ Error: "Failed to get orders" })
  }
}

export async function getOrder(req, res) {
  try {
    const stayId = req.params.orderId
  } catch (err) {
    logger.error("order.controller - Failed to getOrder:" + err)
  }
}

export async function addOrder(req, res) {

}

export async function updateOrderStatus(req, res) {

}