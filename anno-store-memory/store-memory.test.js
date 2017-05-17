process.env.ANNO_BASE_URL = 'http://localhost:3000'
process.env.ANNO_BASE_PATH = ''
const store = new(require('./store-memory'))()
require('../anno-store/store-test')(store, () => {})
