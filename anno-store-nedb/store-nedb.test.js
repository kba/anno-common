process.env.ANNO_BASE_URL = `http://localhost:3000`
process.env.ANNO_NEDB_DIR = `${__dirname}/../temp`

const NedbStore = require('./store-nedb')
const store = new NedbStore()
require('@kba/anno-store').storeTest(store, () => {})
