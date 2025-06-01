import { userService } from './user.service.js'
import { logger } from '../../services/logger.service.js'
import { stayService } from '../stay/stay.service.js'

export async function getUser(req, res) {
    try {
        const user = await userService.getById(req.params.id)
        res.send(user)
    } catch (err) {
        logger.error('Failed to get user', err)
        res.status(400).send({ err: 'Failed to get user' })
    }
}

export async function getUsers(req, res) {
    try {
        const filterBy = {
            txt: req.query?.txt || '',
            minBalance: +req.query?.minBalance || 0
        }
        const users = await userService.query(filterBy)
        res.send(users)
    } catch (err) {
        logger.error('Failed to get users', err)
        res.status(400).send({ err: 'Failed to get users' })
    }
}

export async function deleteUser(req, res) {
    try {
        await userService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete user', err)
        res.status(400).send({ err: 'Failed to delete user' })
    }
}

export async function updateUser(req, res) {
    try {
        const user = req.body
        const savedUser = await userService.update(user)
        res.send(savedUser)
    } catch (err) {
        logger.error('Failed to update user', err)
        res.status(400).send({ err: 'Failed to update user' })
    }
}

export async function getWishlist(req, res) {
    try {
        const userId = req.loggedinUser._id
        const wishlist = await userService.getWishlist(userId)
        res.send(wishlist)
    } catch (err) {
        logger.error("user.controller - Failed to getWishlist: " + err)
        res.status(500).send({ Error: "Failed to get wishlist" })
    }
}

export async function addToWishlist(req, res) {
    try {
        const userId = req.loggedinUser._id
        const stayId = req.body.stayId
        
        const stay = await stayService.getById(stayId)
        
        const miniStayForWishlist = {
            stayId: stay._id,
            name: stay.name,
            imgUrl: stay.imgUrls[0],
            loc: stay.loc,
            type: stay.type,
            roomType: stay.roomType
        }

        const addedWishlistEntry = await userService.addToWishlist(userId, miniStayForWishlist)

        res.send(addedWishlistEntry)
        
    } catch (err) {
        logger.error("user.controller - Failed to addToWishlist: " + err)
        res.status(500).send({ Error: "Failed to add to wishlist" })
    }
}

export async function removeFromWishlist(req, res) {
    try {
        const userId = req.loggedinUser._id
        const stayId = req.body.stayId
        const result = await userService.removeFromWishlist(userId, stayId)
        res.send({result})
    } catch (err) {
        logger.error("user.controller - Failed to removeFromWishlist: " + err)
        res.status(500).send({ Error: "Failed to remove from wishlist" })
    }
}