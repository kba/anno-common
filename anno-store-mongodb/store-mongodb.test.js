process.env.ANNO_BASE_URL = `http://localhost:3000`
process.env.ANNO_MONGODB_PORT = `32123`

const MongodbStore = require('./store-mongodb')
const store = new MongodbStore()
require('../anno-store/store-test')(store, () => {})
