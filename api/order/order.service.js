import { ObjectId } from "mongodb";
import { dbService } from "../../services/db.service.js";
import { logger } from "../../services/logger.service.js";

export const orderService = {
  getHostOrders
}

const ORDERS_COLLECTION = 'orders'

async function getHostOrders(hostId, stayId) {
  const hostIdObj = new ObjectId(hostId)

  try {
    const collection = await dbService.getCollection(ORDERS_COLLECTION)
    
    const criteria = {
      "stay.host.userId": hostIdObj
    }

    if (stayId) {
      criteria["stay._id"] = new ObjectId(stayId)
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
        $match: criteria
      },
      {
        $project: {
          stay: 0
        }
      }
    ]).toArray()

    return orders

  } catch (err) {
    logger.error("order.service - Failed to get orders:" + err)
    throw err
  }
}
