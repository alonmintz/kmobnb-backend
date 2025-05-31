import express from "express";

import { log } from "../../middlewares/logger.middleware.js";
import {
  addReview,
  getReviewsByStayId,
  getReviewsDataByStayId,
  getReviewsGeneralDataByStayId,
} from "./review.controller.js";
import { requireAuth } from "../../middlewares/requireAuth.middleware.js";
import { validateStayId } from "../../middlewares/validateStay.middleware.js";
import { enrichLoggedinUser } from "../../middlewares/enrichLoggedinUser.middleware.js";

const router = express.Router();

router.use(log);

router.get("/:stayId", validateStayId, getReviewsByStayId);
router.get("/:stayId/general", validateStayId, getReviewsGeneralDataByStayId);
router.get("/:stayId/data", validateStayId, getReviewsDataByStayId);
router.post("/", requireAuth, enrichLoggedinUser, addReview);

export const reviewRouter = router;
