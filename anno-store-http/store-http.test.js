// XXX start server before

const HttpStore = require('./store-http')

const store = new HttpStore()
require('../anno-store/store-test')(store, () => {})
