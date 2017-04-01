const store = new(require('./store-memory'))()
require('../anno-store/store-test')(store, () => {})
