import { ObjectId } from "mongodb";
import { logger } from "../../services/logger.service.js";
import { dbService } from "../../services/db.service.js";

export const DEFAULT_PAGE_SIZE = 100;
export const DEFAULT_PAGE_INDEX = 0;
export const DEFAULT_SORT_BY = "at";

const emptyFilter = {
  stayId: null,
  pageSize: DEFAULT_PAGE_SIZE,
  pageIdx: DEFAULT_PAGE_INDEX,
  sortBy: DEFAULT_SORT_BY,
  sortDir: -1,
};

export const reviewsService = {
  getCalculatedData,
  query,
  getGeneralData,
  add,
  getById,
};

async function query(filterBy) {
  filterBy = { ...emptyFilter, ...filterBy };

  try {
    const collection = await dbService.getCollection("reviews");
    const criteria = {
      stayId: ObjectId.createFromHexString(filterBy.stayId),
    };

    const reviews = await collection
      .find(criteria)
      .sort({ [filterBy.sortBy]: filterBy.sortDir })
      .skip(filterBy.pageIdx * filterBy.pageSize)
      .limit(filterBy.pageSize)
      .toArray();

    return reviews;
  } catch (err) {
    logger.error("cannot get reviews by stay id", err);
    throw err;
  }
}

async function getGeneralData(filterBy) {
  filterBy = { ...emptyFilter, ...filterBy };

  try {
    const collection = await dbService.getCollection("reviews");
    const criteria = {
      stayId: ObjectId.createFromHexString(filterBy.stayId),
    };
    const totalReviews = await collection.find(criteria).toArray();

    const reviewsCount = totalReviews.length;
    const starsRatings = reviewsCount
      ? await _getAverageStarsRating(totalReviews)
      : null;

    return { reviewsCount, starsRatings };
  } catch (err) {
    logger.error("cannot get reviews general data by stay id", err);
    throw err;
  }
}

async function getCalculatedData(filterBy) {
  filterBy = { ...emptyFilter, ...filterBy };

  try {
    const collection = await dbService.getCollection("reviews");
    const criteria = {
      stayId: ObjectId.createFromHexString(filterBy.stayId),
    };
    const totalReviews = await collection.find(criteria).toArray();

    const reviewsCount = totalReviews.length;

    const [avgStarsRate, starsRatings, categoryRatings, reviews] =
      await Promise.all([
        reviewsCount ? _getAverageStarsRating(totalReviews) : null,
        _getStarsRatingCount(totalReviews),
        _getAverageCategoryRatings(totalReviews),
        reviewsCount ? query(filterBy) : [],
      ]);

    return {
      reviewsCount,
      avgStarsRate,
      starsRatings,
      categoryRatings,
      reviews,
    };
  } catch (err) {
    logger.error("cannot get reviews data by stay id", err);
    throw err;
  }
}

async function add(review) {
  const { stayId } = review;
  review.stayId = ObjectId.createFromHexString(stayId);
  try {
    const collection = await dbService.getCollection("reviews");
    const insertResult = await collection.insertOne(review);

    return insertResult;
  } catch (err) {
    logger.error("cannot add review", err);
    throw err;
  }
}

async function getById(reviewId) {
  try {
    const collection = await dbService.getCollection("reviews");
    const review = await collection.findOne({
      _id: ObjectId.createFromHexString(reviewId),
    });

    if (!review) return null;

    return review;
  } catch (err) {
    logger.error("error getting review by id", err);
    throw err;
  }
}

//private functions:

async function _getAverageStarsRating(reviews) {
  return Number(
    (
      reviews.reduce((sum, review) => sum + (review.starsRate || 0), 0) /
      reviews.length
    ).toFixed(2)
  );
}

async function _getStarsRatingCount(reviews) {
  if (!reviews.length) {
    return [1, 2, 3, 4, 5].map((rate) => ({
      rate,
      count: 0,
    }));
  }
  return [1, 2, 3, 4, 5].map((rate) => ({
    rate,
    count: reviews.filter((review) => review.starsRate === rate).length,
  }));
}

async function _getAverageCategoryRatings(reviews) {
  const categoryKeys = [
    "cleanliness",
    "accuracy",
    "checkIn",
    "communications",
    "location",
    "value",
  ];

  if (!reviews.length) {
    const zeroRatings = {};
    for (const key of categoryKeys) {
      zeroRatings[key] = 0.0;
    }
    return zeroRatings;
  }

  const categoryRatings = {};

  for (const key of categoryKeys) {
    const rates = reviews
      .map((review) => review.categoryRatings?.[key])
      .filter((rate) => typeof rate === "number");
    categoryRatings[key] = rates.length
      ? Number(
          (rates.reduce((sum, rate) => sum + rate, 0) / rates.length).toFixed(1)
        )
      : null;
  }

  return categoryRatings;
}
