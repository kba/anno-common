// XXX start server before

const HttpStore = require('./store-http')

const store = new HttpStore({
    BASE_URL: 'http://localhost:3000/anno',
    BASE_PATH: '',
})
require('../anno-store/store-test')(store, () => {})
