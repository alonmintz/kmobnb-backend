import { ObjectId } from "mongodb";
import { dbService } from "../../services/db.service.js";

export const orderService = {
  getByHostId
}

const ORDERS_COLLECTION = 'orders'

async function getByHostId(hostId) {
  const hostIdObj = new ObjectId(hostId)
  try {
    const collection = await dbService.getCollection(ORDERS_COLLECTION)
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
        $match: {
          "stay.host.userId": hostIdObj
        }
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
