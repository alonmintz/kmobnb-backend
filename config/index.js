// import configProd from './prod.js'
// import configLocal from './dev.js'

export var config
if (process.env.NODE_ENV === 'production') {
    config = {
        dbURL: process.env.MONGO_URL,
        dbName: process.env.DB_NAME
    }
    console.log('config:', config)
}
else if (process.env.NODE_ENV === 'remoteDev') {
    config = {
        dbURL: process.env.REMOTE_DEV_MONGO_URL,
        dbName: process.env.REMOTE_DEV_DB_URL
    }
    console.log('config:', config)
}
else {
    config = {
        dbURL: 'mongodb://127.0.0.1:27017',
        dbName: 'kmobnb'
    }
    console.log('config:', config)
}

//* Uncomment the following line to use guest mode
// config.isGuestMode = true