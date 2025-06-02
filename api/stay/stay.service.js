import { ObjectId } from "mongodb";
import { logger } from "../../services/logger.service.js";
import { asyncLocalStorage } from "../../services/als.service.js";
import { dbService } from "../../services/db.service.js";
import { reviewsService } from "../review/review.service.js";

export const STAYS_PER_LOAD = 20;
export const DEFAULT_BULK_INDEX = 0;
export const LIST_TYPE_DEFAULT = "default";
export const SORT_BY_DEFAULT = "starsRate";
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
  sortBy: SORT_BY_DEFAULT,
  sortDir: -1,
};

export const stayService = {
  query,
  getById,
  add,
  update,
};

async function query(filterBy) {
  filterBy = { ...emptyFilter, ...filterBy };
  try {
    const criteria = _buildCriteria(filterBy);
    const sort = _buildSort(filterBy);
    const collection = await dbService.getCollection("stays");

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
      { $limit: +filterBy.bulkSize },
    ];

    let stays = await collection.aggregate(pipeline).toArray();
    if (filterBy.listType === LIST_TYPE_DEFAULT) {
      stays = _addNearAvailableDates(stays);
    }

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
    const reviewsData = await reviewsService.getCalculatedData({
      stayId,
      pageSize: 4,
    });

    return { ...stay, reviewsData };
  } catch (err) {
    logger.error("error getting stay by id", err);
    throw err;
  }
}

async function add(stay) {
  try {
    const collection = await dbService.getCollection("stays");
    const insertResult = await collection.insertOne(stay);

    return insertResult;
  } catch (err) {
    logger.error("cannot add stay", err);
    throw err;
  }
}

async function update(stay) {
  const { _id, ...stayToSave } = stay;

  try {
    const criteria = { _id: ObjectId.createFromHexString(stay._id) };
    const collection = await dbService.getCollection("stays");

    const updatedStay = await collection.findOneAndUpdate(
      criteria,
      { $set: stayToSave },
      { returnDocument: "after" }
    );

    return updatedStay;
  } catch (err) {
    logger.error(`cannot update stay ${stay._id}`, err);
    throw err;
  }
}

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

  if (
    filterBy.listType === LIST_TYPE_DEFAULT &&
    filterBy.startDate &&
    filterBy.endDate
  ) {
    criteria.occupancy = {
      $not: {
        $elemMatch: {
          startDate: { $lt: filterBy.endDate },
          endDate: { $gt: filterBy.startDate },
        },
      },
    };
  }

  if (filterBy.listType === LIST_TYPE_BY_HOST) {
    const store = asyncLocalStorage.getStore();
    const loggedinUser = store?.loggedinUser;
    if (loggedinUser?._id) {
      criteria["host.userId"] = ObjectId.createFromHexString(loggedinUser._id);
    } else {
      console.warn("byHost flag was set but no logged in user in ALS");
    }
  }
  return criteria;
}

function _buildSort(filterBy) {
  if (!filterBy.sortBy) return {};
  return { [filterBy.sortBy]: filterBy.sortDir };
}

function _addNearAvailableDates(stays) {
  const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
  const ONE_DAY = 1 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  for (const stay of stays) {
    //  Sort occupancy by startDate
    const occupancy = (stay.occupancy || [])
      .slice()
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    let found = false;
    let startDate = now;

    for (const occ of occupancy) {
      const occStart = new Date(occ.startDate).getTime();
      const occEnd = new Date(occ.endDate).getTime();

      // If the window [startDate, startDate+2days) ends before the next occupancy starts, it's available
      if (startDate + TWO_DAYS < occStart) {
        found = true;
        break;
      }

      // If the window overlaps, move startDate to 1 day after this occupancy's end
      if (startDate < occEnd) {
        startDate = occEnd + ONE_DAY;
      }
    }

    // If no window found in between, set after last occupancy or now
    stay.nearAvailableDates = {
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(startDate + TWO_DAYS).toISOString(),
    };
  }

  return stays;
}
