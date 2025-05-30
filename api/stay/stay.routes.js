import express from "express";

import { log } from "../../middlewares/logger.middleware.js";
import {
  addStay,
  getStayById,
  getStays,
  updateStay,
  updateStayStatus,
} from "./stay.controller.js";

const router = express.Router();

router.use(log);

//todo: add middlewares
router.get("/", getStays);
router.get("/:id", getStayById);
router.post("/", addStay);
router.put("/:id", updateStay);
router.put("/:id/status", updateStayStatus);

export const stayRouter = router;
