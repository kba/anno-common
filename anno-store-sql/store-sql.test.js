process.env.ANNO_BASE_URL = `http://localhost:3000`
process.env.ANNO_BASE_PATH = ``
process.env.ANNO_KNEXFILE = `${__dirname}/knexfile.js`

const store = new(require('.'))()
require('tap').test(store.constructor.name, async t => {
  const StoreTests = new(require('../anno-store/store-test'))(store)
  // console.log(store)
  await StoreTests.testWipe(t)
  // await StoreTests.testCreateGet(t)
  t.end()
})
