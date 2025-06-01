import { logger } from "../../services/logger.service.js"
import { orderService } from "./order.service.js"

export async function getHostOrders(req, res) {
  try {
    const userId = req.loggedinUser._id
    const stayId = req.query.stayId
    logger.debug('order.controller - getOrdersByHostId. hostId is:' + userId + ', stayId: ' + stayId)
    const orders = await orderService.getHostOrders(userId, stayId)
    res.status(200).json(orders)
  } catch (err) {
    logger.error('order.controller - Failed to getHostOrders:' + err)
    res.status(500).send({ Error: "Failed to get orders" })
  }
}

export async function getOrder(req, res) {
  try {
    const orderId = req.params.orderId
    logger.debug('order.controller - getOrder. orderId: ' + orderId)
    const order = await orderService.getOrderById(orderId)
    res.status(200).json(order)
  } catch (err) {
    logger.error("order.controller - Failed to getOrder:" + err)
    res.status(500).send({ Error: "Failed to get order" })
  }
}

export async function addOrder(req, res) {

}

export async function updateOrderStatus(req, res) {

}