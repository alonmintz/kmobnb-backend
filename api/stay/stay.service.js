import { ObjectId } from "mongodb";
import { logger } from "../../services/logger.service.js";
import { asyncLocalStorage } from "../../services/als.service.js";
import { dbService } from "../../services/db.service.js";
import { reviewsService } from "../review/review.service.js";

const STAYS_PER_LOAD = 20;
const DEFAULT_BULK_INDEX = 0;
const LIST_TYPE_DEFAULT = "default";
const LIST_TYPE_BY_HOST = "by-host";

const emptyFilter = {
  status: "",
  city: "",
  startDate: null,
  endDate: null,
  capacity: 0,
  isPetsAllowed: false,
  type: "",
  listType: LIST_TYPE_DEFAULT,
  bulkIdx: DEFAULT_BULK_INDEX,
  bulkSize: STAYS_PER_LOAD,
  sortBy: "starsRate",
  sortDir: -1,
};

export const stayService = {
  query,
  getById,
  add,
  update,
  remove,
};

async function query(filterBy) {
  filterBy = { ...emptyFilter, ...filterBy };

  try {
    const criteria = _buildCriteria(filterBy);
    const sort = _buildSort(filterBy);
    const collection = await dbService.getCollection("stays");

    //todo: refactor long pipeline to calling review service and orders service
    //todo: add filtering by occupancy if startDate & endDate are not null
    const pipeline = [
      { $match: criteria },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "stayId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          starsRate: {
            $cond: [
              { $gt: [{ $size: "$reviews" }, 0] },
              { $round: [{ $avg: "$reviews.starsRate" }, 2] },
              null,
            ],
          },
          reviewsCount: { $size: "$reviews" },
        },
      },
      { $project: { reviews: 0 } },
    ];

    if (filterBy.listType === LIST_TYPE_DEFAULT) {
      console.log("entered orders lookup");

      pipeline.push(
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "stayId",
            as: "orders",
          },
        },
        {
          $addFields: {
            occupancy: {
              $map: {
                input: "$orders",
                as: "order",
                in: {
                  startDate: "$$order.startDate",
                  endDate: "$$order.endDate",
                },
              },
            },
          },
        },
        { $project: { orders: 0 } }
      );
    }

    pipeline.push(
      {
        $project: {
          _id: 1,
          name: 1,
          imgUrls: 1,
          price: 1,
          loc: 1,
          occupancy: 1,
          status: 1,
          starsRate: 1,
          reviewsCount: 1,
        },
      },
      { $sort: sort },
      { $skip: filterBy.bulkIdx * filterBy.bulkSize },
      { $limit: filterBy.bulkSize }
    );

    const stays = await collection.aggregate(pipeline).toArray();
    // console.log(JSON.stringify(stays, null, 2));

    return stays;
  } catch (err) {
    logger.error("cannot find stays", err);
    throw err;
  }
}

async function getById(stayId) {
  try {
    const collection = await dbService.getCollection("stays");
    const stay = await collection.findOne({
      _id: ObjectId.createFromHexString(stayId),
    });

    if (!stay) return null;
    const reviewsData = await reviewsService.getReviewsData({
      stayId,
      pageSize: 4,
    });

    return { ...stay, reviewsData };
  } catch (err) {
    logger.error("error getting stay by id", err);
    throw err;
  }
}

async function add(stay) {}

async function update(stay) {}

async function remove(stayId) {}

function _buildCriteria(filterBy) {
  const criteria = {
    status: { $regex: filterBy.status, $options: "i" },
    ["loc.city"]: { $regex: filterBy.city, $options: "i" },
    type: { $regex: filterBy.type, $options: "i" },
    capacity: { $gte: filterBy.capacity },
  };

  if (filterBy.isPetsAllowed) {
    criteria.amenities = { $in: ["Pets allowed"] };
  }

  if (filterBy.listType === LIST_TYPE_BY_HOST) {
    const store = asyncLocalStorage.getStore();
    const loggedinUser = store?.loggedinUser;
    if (loggedinUser?._id) {
      criteria["host.userId"] = ObjectId.createFromHexString(loggedinUser._id);
    } else {
      console.warn("byHost flag was set but no loggedinUser in ALS");
    }
  }
  return criteria;
}

function _buildSort(filterBy) {
  if (!filterBy.sortBy) return {};
  return { [filterBy.sortBy]: filterBy.sortDir };
}
