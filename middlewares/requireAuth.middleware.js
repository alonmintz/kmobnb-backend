import { asyncLocalStorage } from "../services/als.service.js";

export function requireAuth(req, res, next) {
  const { loggedinUser } = asyncLocalStorage.getStore();
  if (!loggedinUser) {
    return res.status(401).send({ err: "Not Authenticated" });
  }
  // console.log('requireAuth, loggedinUser:', loggedinUser)
  req.loggedinUser = loggedinUser;
  next();
}
