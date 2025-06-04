import { ObjectId } from "mongodb";
import { logger } from "../../services/logger.service.js";
import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT_BY,
  reviewsService,
} from "./review.service.js";

export async function getReviewsDataByStayId(req, res) {
  try {
    const { params } = req;
    const stayId = params.stayId;

    const filterBy = {
      stayId,
      pageSize: +req.query.pageSize || DEFAULT_PAGE_SIZE,
      pageIdx: +req.query.pageIdx || DEFAULT_PAGE_INDEX,
      sortBy: req.query.sortBy || DEFAULT_SORT_BY,
      sortDir: +req.query.sortDir || -1,
    };

    const reviewData = await reviewsService.getCalculatedData(filterBy);
    res.status(200).json(reviewData);
  } catch (err) {
    logger.error("Failed to get reviews calculated data", err);
    res.status(500).send({ err: "Failed to get reviews calculated data" });
  }
}

export async function getReviewsGeneralDataByStayId(req, res) {
  try {
    const { params } = req;
    const stayId = params.stayId;
    const filterBy = { stayId };

    const reviewGeneralData = await reviewsService.getGeneralData(filterBy);

    res.status(200).json(reviewGeneralData);
  } catch (err) {
    logger.error("Failed to get reviews general data", err);
    res.status(500).send({ err: "Failed to get reviews general data" });
  }
}

export async function getReviewsByStayId(req, res) {
  try {
    const { params } = req;
    const stayId = params.stayId;

    const filterBy = {
      stayId,
      pageSize: +req.query.pageSize || DEFAULT_PAGE_SIZE,
      pageIdx: +req.query.pageIdx || DEFAULT_PAGE_INDEX,
      sortBy: req.query.sortBy || DEFAULT_SORT_BY,
      sortDir: +req.query.sortDir || -1,
    };

    const reviews = await reviewsService.query(filterBy);
    res.status(200).json(reviews);
  } catch (err) {
    logger.error(`Failed to get reviews for stay ${stayId}`, err);
    res.status(500).send({ err: `Failed to get reviews for stay ${stayId}` });
  }
}

export async function addReview(req, res) {
  const { loggedinUser, body: review } = req;
  const { fullname, imgUrl, _id: userIdString } = loggedinUser;
  const userId = ObjectId.createFromHexString(userIdString);
  review.by = { fullname, imgUrl, userId };
  try {
    const insertResult = await reviewsService.add(review);
    const addedReview = await reviewsService.getById(
      insertResult.insertedId.toString()
    );
    res.status(201).json(addedReview);
  } catch (err) {
    logger.error("Failed to add review", err);
    res.status(500).send({ err: "Failed to add review" });
  }
}
