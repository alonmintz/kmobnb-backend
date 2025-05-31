import express from 'express'

import { login, signup, logout } from './auth.controller.js'
// import { log } from '../../middlewares/logger.middleware.js'
import { requireAuth } from '../../middlewares/requireAuth.middleware.js'

const router = express.Router()

// router.use(log)

router.post('/login', login)
router.post('/signup', signup)
router.post('/logout', requireAuth, logout)

export const authRoutes = router