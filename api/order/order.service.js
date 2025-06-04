import { ObjectId } from "mongodb";
import { dbService } from "../../services/db.service.js";
import { logger } from "../../services/logger.service.js";
import { stayService } from "../stay/stay.service.js";

export const orderService = {
  getHostOrders,
  getUserOrders,
  getOrderById,
  add,
  updateStatus,
};

const ORDERS_COLLECTION = "orders";

// order status
const CANCELED = "canceled";

async function getHostOrders(hostId, listingId) {
  try {
    const collection = await dbService.getCollection(ORDERS_COLLECTION);

    const matchCriteria = {
      "stay.host.userId": ObjectId.createFromHexString(hostId),
    };

    if (listingId) {
      matchCriteria["stay._id"] = ObjectId.createFromHexString(listingId);
    }

    const orders = await collection
      .aggregate([
        {
          $lookup: {
            from: "stays",
            localField: "stayId",
            foreignField: "_id",
            as: "stay",
          },
        },
        {
          $match: matchCriteria,
        },
        {
          $project: {
            stay: 0,
          },
        },
      ])
      .toArray();

    return orders;
  } catch (err) {
    logger.error("order.service - Failed to get orders: " + err);
    throw err;
  }
}

async function getUserOrders(userId) {
  try {
    const collection = await dbService.getCollection(ORDERS_COLLECTION);
    const orders = await collection
      .aggregate([
        {
          $match: { userId: ObjectId.createFromHexString(userId) },
        },
        {
          $lookup: {
            from: "stays",
            localField: "stayId",
            foreignField: "_id",
            as: "stay",
          },
        },
        {
          $unwind: "$stay",
        },
        {
          $addFields: {
            stayImgUrl: { $arrayElemAt: ["$stay.imgUrls", 0] },
            city: "$stay.loc.city",
          },
        },
        {
          $project: {
            stay: 0,
          },
        },
      ])
      .toArray();

    const now = new Date();

    const result = {
      past: [],
      active: [],
      future: [],
    };

    for (const order of orders) {
      const startDate = new Date(order.startDate);
      const endDate = new Date(order.endDate);

      if (endDate < now) {
        result.past.push(order);
      } else if (startDate > now) {
        result.future.push(order);
      } else {
        result.active.push(order);
      }
    }

    return result;
  } catch (err) {
    logger.error("order.service - Failed to getUserOrders: " + err);
    throw err;
  }
}

async function getOrderById(orderId) {
  try {
    const collection = await dbService.getCollection(ORDERS_COLLECTION);

    const order = await collection.findOne({
      _id: ObjectId.createFromHexString(orderId),
    });

    return order;
  } catch (err) {
    logger.error("order.service - Failed to getOrderById: " + err);
    throw err;
  }
}

async function add(order) {
  try {
    const collection = await dbService.getCollection(ORDERS_COLLECTION);
    const insertResult = await collection.insertOne(order);

    const occupancyObj = {
      stayId: order.stayId,
      orderId: insertResult.insertedId,
      startDate: order.startDate,
      endDate: order.endDate,
    };

    await stayService.addOccupancy(occupancyObj);

    return insertResult;
  } catch (err) {
    logger.error("order.service - Failed to add: " + err);
    throw err;
  }
}

async function updateStatus(orderId, status) {
  try {
    const collection = await dbService.getCollection(ORDERS_COLLECTION);

    const updatedOrder = await collection.findOneAndUpdate(
      { _id: ObjectId.createFromHexString(orderId) },
      { $set: { status } },
      { returnDocument: "after" }
    );

    if (status === CANCELED) {
      const updateResult = await stayService.removeOccupancy(
        updatedOrder.stayId,
        updatedOrder._id
      );
    }

    return updatedOrder;
  } catch (err) {
    logger.error("order.service - Failed to update: " + err);
    throw err;
  }
}
