export default {
    dbURL: process.env.MONGO_URL || 'mongodb+srv://user:password@address/', // TODO: get from env var
    dbName: process.env.DB_NAME || 'STAY_DB'
}
