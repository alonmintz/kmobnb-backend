import express from "express";

import { log } from "../../middlewares/logger.middleware.js";
import {
  addReview,
  getReviewsByStayId,
  getReviewsDataByStayId,
  getReviewsGeneralDataByStayId,
} from "./review.controller.js";

const router = express.Router();

router.use(log);

//todo: add middlewares
router.get("/:stayId", getReviewsByStayId);
router.get("/:stayId/general", getReviewsGeneralDataByStayId);
router.get("/:stayId/data", getReviewsDataByStayId);
router.post("/", addReview);

export const reviewRouter = router;
