import { logger } from "../../services/logger.service.js";
import { ObjectId } from "mongodb";

import {
  LIST_TYPE_DEFAULT,
  DEFAULT_BULK_INDEX,
  STAYS_PER_LOAD,
  SORT_BY_DEFAULT,
  stayService,
} from "./stay.service.js";

export async function getStays(req, res) {
  try {
    const filterBy = {
      status: req.query.status || "active",
      city: req.query.city || "",
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
      capacity: +req.query.capacity || 0,
      isPetsAllowed: req.query.isPetsAllowed === "true" || false,
      type: req.query.type || "",
      listType: req.query.listType || LIST_TYPE_DEFAULT,
      bulkIdx: req.query.bulkIdx || DEFAULT_BULK_INDEX,
      bulkSize: req.query.bulkSize || STAYS_PER_LOAD,
      sortBy: req.query.sortBy || SORT_BY_DEFAULT,
      sortDir: +req.query.sortDir || -1,
    };

    const stays = await stayService.query(filterBy);
    res.status(200).json(stays);
  } catch (err) {
    logger.error("Failed to get stays", err);
    res.status(500).send({ err: "Failed to get stays" });
  }
}

export async function getStayById(req, res) {
  try {
    const stayId = req.params.id;
    const stay = await stayService.getById(stayId);
    res.status(200).json(stay);
  } catch (err) {
    logger.error(`Failed to get stay ${stayId}`, err);
    res.status(400).send({ err: "Failed to get stay" });
  }
}

export async function addStay(req, res) {
  const { loggedinUser, body: stay } = req;
  const { _id: userIdString, fullname, imgUrl, isSuperHost } = loggedinUser;
  const userId = ObjectId.createFromHexString(userIdString);
  stay.host = { userId, fullname, imgUrl, isSuperHost };
  stay.occupancy = [];
  try {
    const insertResult = await stayService.add(stay);
    const addedStay = await stayService.getById(
      insertResult.insertedId.toString()
    );
    res.status(201).json(addedStay);
  } catch (err) {
    logger.error("Failed to add stay", err);
    res.status(500).send({ err: "Failed to add stay" });
  }
}

export async function updateStay(req, res) {
  const { params, body: stay } = req;
  const stayId = params.id;
  try {
    const updatedStay = await stayService.update(stay);
    res.status(201).json(updatedStay);
  } catch (err) {
    logger.error(`Failed to update stay ${stayId}`, err);
    res.status(500).send({ err: "Failed to update stay" });
  }
}

export async function updateStayStatus(req, res) {
  const { body, loggedinUser } = req;
  const stayId = body._id;
  const status = body.status;
  const userId = loggedinUser._id;

  if (status !== "active" && status !== "inactive")
    throw new Error("Invalid status");
  const host = { ...loggedinUser, userId };
  delete host._id;

  const updateStatusPayload = {
    _id: stayId,
    host,
    status,
  };

  try {
    const updatedStay = await stayService.update(updateStatusPayload);
    res.status(201).json(updatedStay);
  } catch (err) {
    logger.error(
      `stay.controller - Failed to set stay ${stayId} status to ${status}`,
      err
    );
    res.status(500).send({ err: `Failed to set stay status to ${status}` });
  }
}
