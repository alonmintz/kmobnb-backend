import express from 'express'

import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'
import { getUser, getUsers, deleteUser, updateUser, getWishlist, addToWishlist, removeFromWishlist } from './user.controller.js'

const router = express.Router()

router.use(log)

// router.get('/', getUsers)
// router.get('/:id', getUser)
// router.put('/:id', requireAuth, updateUser)
// router.delete('/:id', requireAuth, requireAdmin, deleteUser)

router.get('/wishlist', requireAuth, getWishlist)
router.post('/wishlist', requireAuth, addToWishlist)
router.delete('/wishlist', requireAuth, removeFromWishlist)


export const userRoutes = router