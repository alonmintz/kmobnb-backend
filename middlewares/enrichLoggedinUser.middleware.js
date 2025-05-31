import { authService } from "../api/auth/auth.service.js";
import { userService } from "../api/user/user.service.js";

export async function enrichLoggedinUser(req, res, next) {
  const loggedinUser = req.cookies?.accessToken ? authService.validateToken(req.cookies.accessToken) : null
  
  if (loggedinUser){
    try {
      const enrichments = await userService.getById(loggedinUser._id)
      delete enrichments._id
      req.loggedinUser = {...loggedinUser, ...enrichments}
    } catch (err) {
      console.log('err enriching:', err)
    }
  }
  
  next()
}