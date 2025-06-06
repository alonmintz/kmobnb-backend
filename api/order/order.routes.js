import express from "express";
import { log } from "../../middlewares/logger.middleware.js";
import { requireAuth } from "../../middlewares/requireAuth.middleware.js";
import {
  addOrder,
  getOrder,
  getHostOrders,
  getUserOrders,
  updateOrderStatus,
} from "./order.controller.js";
import { enrichLoggedinUser } from "../../middlewares/enrichLoggedinUser.middleware.js";

const router = express.Router();

router.use(log);

router.get("/host", requireAuth, getHostOrders);
router.get("/user", requireAuth, getUserOrders);
router.get("/:orderId", requireAuth, getOrder);
router.post("/", requireAuth, enrichLoggedinUser, addOrder);
router.put("/:orderId", requireAuth, updateOrderStatus);

export const orderRouter = router;
