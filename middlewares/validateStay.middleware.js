import { stayService } from "../api/stay/stay.service.js";

export function validateStayId(req, res, next) {
  const { params } = req;
  const stayId = params.stayId;
  const stay = stayService.getById(stayId);
  if (!stay) {
    res.status(400).send("Stay id doesn't exist");
  }
  next();
}

export async function validateUserIdIsHostId(req, res, next) {
  const { loggedinUser, body: stay } = req;
  const stayToCheck = await stayService.getById(stay._id);
  if (!stayToCheck) {
    res.status(400).send("Stay id doesn't exist");
  }
  const { _id: loggedinUserId } = loggedinUser;
  const { host } = stayToCheck;

  if (loggedinUserId !== host.userId.toString()) {
    res.status(400).send("Stay is not owned by logged in user");
  }
  console.log("validateUserIdIsHostId middleware passed successfully");

  next();
}

export function validateStayRequiredFields(req, res, next) {
  const { body: stay } = req;

  if (!stay.name || stay.name.length === 0) {
    console.log("Name is required");
    return res.status(400).send({ err: "Name is required" });
  }
  if (!stay.price || stay.price <= 0) {
    console.log("Price must be greater than 0");
    return res.status(400).send({ err: "Price must be greater than 0" });
  }
  if (!stay.summary || stay.summary.length > 500) {
    console.log("Price must be greater than 0");
    return res
      .status(400)
      .send({ err: "Summary must be 500 characters or less" });
  }
  if (!stay.capacity || stay.capacity <= 0) {
    return res.status(400).send({ err: "Capacity must be greater than 0" });
  }
  if (!stay.bathrooms || stay.bathrooms <= 0) {
    return res.status(400).send({ err: "Bathrooms must be greater than 0" });
  }
  if (!stay.bedrooms || stay.bedrooms <= 0) {
    return res.status(400).send({ err: "Bedrooms must be greater than 0" });
  }
  if (
    !stay.roomType ||
    !["Entire home/apartment", "Private room", "Shared room"].includes(
      stay.roomType
    )
  ) {
    return res.status(400).send({ err: "Invalid room type" });
  }
  if (!stay.status || stay.status === "") {
    return res.status(400).send({ err: "Status is required" });
  }
  if (!stay.loc || !stay.loc.city || stay.loc.city === "") {
    return res.status(400).send({ err: "Location city is required" });
  }
  console.log("validateStayRequiredFields middleware passed successfully");

  next();
}
