import { ObjectId } from "mongodb"
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
    logger.error("order.controller - Failed to getOrder: " + err)
    res.status(500).send({ Error: "Failed to get order" })
  }
}

export async function addOrder(req, res) {
  try {
    const order = {
      userId: ObjectId.createFromHexString(req.loggedinUser._id),
      stayId: ObjectId.createFromHexString(req.body.stayId),
      guests: req.body.guests,
      price: req.body.price,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      orderTime: new Date().toISOString()
    }

    const insertResult = await orderService.add(order)
    const addedOrder = await orderService.getOrderById(
      insertResult.insertedId.toString()
    )
    
    res.status(200).send(addedOrder)
  } catch (err) {
    logger.error("order.controller - Failed to addOrder: " + err)
    res.status(500).send({ Error: "Failed to add order" })
  }
}

export async function updateOrderStatus(req, res) {

}