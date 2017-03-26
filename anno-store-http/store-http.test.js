// XXX start server before
// process.env.ANNO_DEBUG = true

const HttpStore = require('./store-http')

const store = new HttpStore()
require('@kba/anno-store').storeTest(store, () => {})
