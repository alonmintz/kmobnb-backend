import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { ObjectId } from 'mongodb'

export const userService = {
    add, // Create (Signup)
    getById, // Read (Profile page)
    update, // Update (Edit profile)
    remove, // Delete (remove user)
    query, // List (of users)
    getByUsername, // Used for Login
    getWishlist,
    addToWishlist,
    removeFromWishlist
}

const USERS_COLLECTION = 'users'

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection(USERS_COLLECTION)
        var users = await collection.find(criteria).toArray()
        users = users.map(user => {
            delete user.password
            user.createdAt = user._id.getTimestamp()
            // Returning fake fresh data
            // user.createdAt = Date.now() - (1000 * 60 * 60 * 24 * 3) // 3 days ago
            return user
        })
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        var criteria = { _id: ObjectId.createFromHexString(userId) }

        const collection = await dbService.getCollection(USERS_COLLECTION)
        const user = await collection.findOne(criteria)
        delete user.password

        // criteria = { byUserId: userId }

        // // user.givenReviews = await reviewService.query(criteria)
        // user.givenReviews = user.givenReviews.map(review => {
        //     delete review.byUser
        //     return review
        // })

        return user
    } catch (err) {
        logger.error(`user.service - error while finding user by id: ${userId}:`, err)
        throw err
    }
}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection(USERS_COLLECTION)
        const user = await collection.findOne({ username })
        return user
    } catch (err) {
        logger.error(`user.service - error while finding user by username: ${username}:`, err)
        throw err
    }
}

async function remove(userId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(userId) }

        const collection = await dbService.getCollection(USERS_COLLECTION)
        await collection.deleteOne(criteria)
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    try {
        // pick only updatable properties
        const userToSave = {
            _id: ObjectId.createFromHexString(user._id),
            fullname: user.fullname,
        }
        const collection = await dbService.getCollection(USERS_COLLECTION)
        await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
        return userToSave
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function add(user) {
    try {
        // pick only updatable fields!
        const userToAdd = {
            username: user.username,
            password: user.pwHash,
            fullname: user.fullname,
            imgUrl: user.imgUrl,
            isAdmin: user.isAdmin,
            isHost: user.isHost
        }
        const collection = await dbService.getCollection(USERS_COLLECTION)
        await collection.insertOne(userToAdd)
        return userToAdd
    } catch (err) {
        logger.error('cannot add user', err)
        throw err
    }
}

async function getWishlist(userId) {
    try {
        const collection = await dbService.getCollection(USERS_COLLECTION)
        const user = await collection.findOne(
            { _id: ObjectId.createFromHexString(userId) },
            { projection: { wishlist: 1 } }
        )
        return user?.wishlist || []
    } catch (err) {
        logger.error("user.service - Failed to getWishlist: " + err)
        throw err
    }
}

async function addToWishlist(userId, miniStay) {
    const userIdObj = ObjectId.createFromHexString(userId)
    try {
        const collection = await dbService.getCollection(USERS_COLLECTION)

        const result = await collection.findOneAndUpdate(
            {
                _id: userIdObj,
                'wishlist.stayId': miniStay.stayId
            },
            { $set: { 'wishlist.$': miniStay } },
            { returnDocument: 'after', }
        )

        if (!result) {
            await collection.findOneAndUpdate(
                { _id: userIdObj },
                { $push: { wishlist: miniStay } },
                { returnDocument: 'after' }
            )
        }

        return miniStay
    } catch (err) {
        logger.error("user.service - Failed to addToWishlist: " + err)
        throw err
    }
}

async function removeFromWishlist(userId, stayId) {
    try {
        const stayIdObj = ObjectId.createFromHexString(stayId)
        const collection = await dbService.getCollection(USERS_COLLECTION)
        const result = await collection.updateOne(
            { _id: ObjectId.createFromHexString(userId) },
            { $pull: { wishlist: { stayId: stayIdObj } } }
        )
        return stayId
    } catch (err) {
        logger.error("user.service - Failed to removeFromWishList: " + err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [
            {
                username: txtCriteria,
            },
            {
                fullname: txtCriteria,
            },
        ]
    }
    if (filterBy.minBalance) {
        criteria.score = { $gte: filterBy.minBalance }
    }
    return criteria
}