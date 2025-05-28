// import configProd from './prod.js'
// import configLocal from './dev.js'

export var config
if (process.env.NODE_ENV === 'production') {
    config = {
        dbURL: process.env.MONGO_URL,
        dbName: process.env.DB_NAME
    }
}
else if (process.env.NODE_ENV === 'remoteDev') {
    config = {
        dbURL: process.env.REMOTE_DEV_MONGO_URL,
        dbName: process.env.REMOTE_DEV_DB_URL
    }
}
else {
    config = {
        dbURL: 'mongodb://127.0.0.1:27017',
        dbName: 'kmobnb'
    }
}

//* Uncomment the following line to use guest mode
// config.isGuestMode = true