import { ObjectId } from "mongodb";
import { dbService } from "../../services/db.service.js";
import { logger } from "../../services/logger.service.js";

export const orderService = {
  getHostOrders,
  getOrderById,
  add,
  updateStatus
}

const ORDERS_COLLECTION = 'orders'

async function getHostOrders(hostId, listingId) {
  try {
    const collection = await dbService.getCollection(ORDERS_COLLECTION)

    const matchCriteria = {
      "stay.host.userId": ObjectId.createFromHexString(hostId)
    }

    if (listingId) {
      matchCriteria["stay._id"] = ObjectId.createFromHexString(listingId)
    }

    const orders = await collection.aggregate([
      {
        $lookup: {
          from: "stays",
          localField: "stayId",
          foreignField: "_id",
          as: "stay"
        }
      },
      {
        $match: matchCriteria
      },
      {
        $project: {
          stay: 0
        }
      }
    ]).toArray()

    return orders

  } catch (err) {
    logger.error("order.service - Failed to get orders: " + err)
    throw err
  }
}

async function getOrderById(orderId) {
  try {
    const collection = await dbService.getCollection(ORDERS_COLLECTION)

    const order = await collection.findOne({
      _id: ObjectId.createFromHexString(orderId)
    })

    return order

  } catch (err) {
    logger.error("order.service - Failed to getOrderById: " + err)
    throw err
  }
}

async function add(order) {
  try {
    const collection = await dbService.getCollection(ORDERS_COLLECTION)
    const insertResult = await collection.insertOne(order)
    return insertResult
  } catch (err) {
    logger.error("order.service - Failed to add: " + err)
    throw err
  }
}

async function updateStatus(orderId, status) {
  try {
    const collection = await dbService.getCollection(ORDERS_COLLECTION)

    const updatedOrder = await collection.findOneAndUpdate(
      { _id: ObjectId.createFromHexString(orderId) },
      { $set: { status } },
      { returnDocument: "after" }
    )

    return updatedOrder
  } catch (err) {
    logger.error("order.service - Failed to update: " + err)
    throw err
  }

}