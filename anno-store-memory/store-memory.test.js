process.env.ANNO_BASE_URL = 'http://localhost:3000'
process.env.ANNO_BASE_PATH = ''

const store = new(require('.'))()
require('tap').test(store.constructor.name, async t => {
  const StoreTests = new(require('../anno-store/store-test'))(store)

  await StoreTests.testAll(t)

  t.end()
})
