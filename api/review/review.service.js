import { ObjectId } from "mongodb";
import { logger } from "../../services/logger.service.js";
import { asyncLocalStorage } from "../../services/als.service.js";
import { dbService } from "../../services/db.service.js";

const PAGE_SIZE = 10;
const DEFAULT_PAGE_INDEX = 0;

const emptyFilter = {
  stayId: null,
  pageSize: PAGE_SIZE,
  pageIdx: DEFAULT_PAGE_INDEX,
  sortBy: "at",
  sortDir: -1,
};

export const reviewsService = {
  getReviewsData,
  getReviewsDisplay,
  getReviewsGeneralData,
};

async function getReviewsDisplay(filterBy) {
  filterBy = { ...emptyFilter, ...filterBy };

  try {
    const collection = await dbService.getCollection("reviews");
    const criteria = {
      stayId: ObjectId.createFromHexString(filterBy.stayId),
    };
    console.log("filterBy.pageSize:", filterBy.pageSize);

    const reviews = await collection
      .find(criteria)
      .project({ at: 1, by: 1, txt: 1, starsRate: 1, _id: 0 })
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

async function getReviewsGeneralData(filterBy) {
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

async function getReviewsData(filterBy) {
  filterBy = { ...emptyFilter, ...filterBy };

  try {
    const collection = await dbService.getCollection("reviews");
    const criteria = {
      stayId: ObjectId.createFromHexString(filterBy.stayId),
    };
    const totalReviews = await collection.find(criteria).toArray();

    const reviewsCount = totalReviews.length;

    const [avgStarsRate, starsRatings, categoryRatings, reviewsDisplay] =
      await Promise.all([
        reviewsCount ? _getAverageStarsRating(totalReviews) : null,
        _getStarsRatingCount(totalReviews),
        _getAverageCategoryRatings(totalReviews),
        getReviewsDisplay(filterBy),
      ]);

    return {
      reviewsCount,
      avgStarsRate,
      starsRatings,
      categoryRatings,
      reviewsDisplay,
    };
  } catch (err) {
    logger.error("cannot get reviews data by stay id", err);
    throw err;
  }
}

async function _getAverageStarsRating(reviews) {
  return Number(
    (
      reviews.reduce((sum, review) => sum + (review.starsRate || 0), 0) /
      reviews.length
    ).toFixed(2)
  );
}

async function _getStarsRatingCount(reviews) {
  return [1, 2, 3, 4, 5].map((rate) => ({
    rate,
    count: reviews.filter((review) => review.starsRate === rate).length,
  }));
}

async function _getAverageCategoryRatings(reviews) {
  const categoryKeys = [
    { key: "cleanliness", label: "Cleanliness" },
    { key: "accuracy", label: "Accuracy" },
    { key: "checkIn", label: "Check-in" },
    { key: "communications", label: "Communication" },
    { key: "location", label: "Location" },
    { key: "value", label: "Value" },
  ];

  const categoryRatings = categoryKeys.map((cat) => {
    const rates = reviews
      .map((review) => review.categoryRatings?.[cat.key])
      .filter((rate) => typeof rate === "number");
    return {
      category: cat.label,
      avgRate: rates.length
        ? Number(
            (rates.reduce((sum, rate) => sum + rate, 0) / rates.length).toFixed(
              2
            )
          )
        : null,
    };
  });

  return categoryRatings;
}
