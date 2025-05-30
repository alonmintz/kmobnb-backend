import { logger } from "../../services/logger.service.js";
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
      status: req.query.status || "",
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

//todo: add middleware that validates user logged in
//todo: add middleware to validate stay entity
export async function addStay(req, res) {
  const { loggedinUser, body: stay } = req;
  try {
    //todo: EYAL
    //todo: call userService to populate host
    // const user = userService.futureFunction(loggedinUser);
    // stay.host = {object with necessary user fields}

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

//todo: add middleware that validates user logged in
//todo: add middleware that validates logged in user id to stay's host id
//todo: add middleware to validate stay entity
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

//todo: add middleware that validates user logged in
//todo: add middleware that validates logged in user id to stay's host id
export async function updateStayStatus(req, res) {
  const { params, body } = req;
  const stayId = params.id;
  const status = body.status;

  if (status !== "active" && status !== "inactive")
    throw new Error("Invalid status");

  const updateStatusPayload = { _id: stayId, status };
  try {
    const updatedStay = await stayService.update(updateStatusPayload);
    res.status(201).json(updatedStay);
  } catch (err) {
    logger.error(`Failed to set stay ${stayId} status to ${status}`, err);
    res.status(500).send({ err: `Failed to set stay status to ${status}` });
  }
}
