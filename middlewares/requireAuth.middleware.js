import { asyncLocalStorage } from "../services/als.service.js";

export function requireAuth(req, res, next) {
  const { loggedinUser } = asyncLocalStorage.getStore();
  if (!loggedinUser) {
    return res.status(401).send("Not Authenticated");
  }
  //todo: EYAL implement here the userService getById
  //needs to be: req.loggedinUser = the full user returned from service
  req.loggedinUser = loggedinUser;
  next();
}
