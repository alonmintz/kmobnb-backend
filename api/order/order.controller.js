import { ObjectId } from "mongodb";
import { logger } from "../../services/logger.service.js";
import { orderService } from "./order.service.js";
// import { genSaltSync } from "bcrypt"
import { stayService } from "../stay/stay.service.js";
import { getDayDiff } from "../../services/util.service.js";
import {
  SOCKET_EVENT_ORDER_ADDED,
  SOCKET_EVENT_ORDER_STATUS_UPDATE,
  socketService,
} from "../../services/socket.service.js";

const DAILY_SERVICE_FEE = 4;

// order status
const PENDING = "pending";

export async function getHostOrders(req, res) {
  try {
    const userId = req.loggedinUser._id;
    const listingId = req.query.listingId;
    // logger.debug('order.controller - getOrdersByHostId. hostId is:' + userId + ', stayId: ' + stayId)
    const orders = await orderService.getHostOrders(userId, listingId);
    res.status(200).json(orders);
  } catch (err) {
    logger.error("order.controller - Failed to getHostOrders:" + err);
    res.status(500).send({ Error: "Failed to get orders" });
  }
}

export async function getUserOrders(req, res) {
  try {
    const userId = req.loggedinUser._id;
    const orders = await orderService.getUserOrders(userId);
    res.status(200).json(orders);
  } catch (err) {
    logger.error("order.controller - Failed to getHostOrders:" + err);
    res.status(500).send({ Error: "Failed to get orders" });
  }
}

export async function getOrder(req, res) {
  try {
    const orderId = req.params.orderId;
    logger.debug("order.controller - getOrder. orderId: " + orderId);
    const order = await orderService.getOrderById(orderId);
    res.status(200).json(order);
  } catch (err) {
    logger.error("order.controller - Failed to getOrder: " + err);
    res.status(500).send({ Error: "Failed to get order" });
  }
}

export async function addOrder(req, res) {
  try {
    const userInput = req.body;

    const listingFromBackend = await stayService.getById(userInput.stayId);
    const listingPricePerNight = listingFromBackend.price;
    const totalNights = getDayDiff(userInput.startDate, userInput.endDate);
    const totalPrice =
      totalNights * listingPricePerNight + totalNights * DAILY_SERVICE_FEE;

    const order = {
      userId: ObjectId.createFromHexString(req.loggedinUser._id),
      userFullname: req.loggedinUser.fullname,
      userImgUrl: req.loggedinUser?.imgUrl || "",
      stayId: ObjectId.createFromHexString(userInput.stayId),
      stayName: listingFromBackend.name,
      hostId: listingFromBackend.host.userId,
      guests: userInput.guests,
      startDate: userInput.startDate,
      endDate: userInput.endDate,
      price: totalPrice,
      orderTime: new Date().toISOString(),
      status: PENDING,
    };

    const insertResult = await orderService.add(order);
    const addedOrder = await orderService.getOrderById(
      insertResult.insertedId.toString()
    );
    const { hostId, stayName, stayId } = addedOrder;

    socketService.emitToUser({
      type: SOCKET_EVENT_ORDER_ADDED,
      data: { hostId, stayName, stayId },
      userId: hostId,
    });
    res.status(201).send(addedOrder);
  } catch (err) {
    logger.error("order.controller - Failed to addOrder: " + err);
    res.status(500).send({ Error: "Failed to add order" });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const orderId = req.params.orderId;
    const status = req.body.status;
    const order = await orderService.getOrderById(orderId);
    const { status: oldStatus } = order;

    if (oldStatus !== PENDING) {
      logger.error(
        "order.controller - Failed to updateOrderStatus: Order status already set"
      );
      res.status(403).send({ Error: "Order status already set" });
      return;
    }

    const updatedOrder = await orderService.updateStatus(orderId, status);
    const { status: updatedStatus, userId, stayName } = updatedOrder;
    socketService.emitToUser({
      type: SOCKET_EVENT_ORDER_STATUS_UPDATE,
      data: { status: updatedStatus, stayName },
      userId: userId,
    });

    res.status(201).send(updatedOrder);
  } catch (err) {
    logger.error("order.controller - Failed to updateOrderStatus: " + err);
    res.status(500).send({ Error: "Failed to update order status" });
  }
}
