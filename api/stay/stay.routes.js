import express from "express";

import { log } from "../../middlewares/logger.middleware.js";
import {
  addStay,
  getStayById,
  getStays,
  updateStay,
  updateStayStatus,
} from "./stay.controller.js";
import { requireAuth } from "../../middlewares/requireAuth.middleware.js";
import {
  validateStayRequiredFields,
  validateUserIdIsHostId,
} from "../../middlewares/validateStay.middleware.js";
import { enrichLoggedinUser } from "../../middlewares/enrichLoggedinUser.middleware.js";

const router = express.Router();

router.use(log);

router.get("/", getStays);
router.get("/:id", getStayById);
router.post(
  "/",
  requireAuth,
  enrichLoggedinUser,
  validateStayRequiredFields,
  addStay
);
router.put(
  "/:id",
  requireAuth,
  enrichLoggedinUser,
  validateUserIdIsHostId,
  validateStayRequiredFields,
  updateStay
);
router.put(
  "/:id/status",
  requireAuth,
  enrichLoggedinUser,
  validateUserIdIsHostId,
  updateStayStatus
);

export const stayRouter = router;
