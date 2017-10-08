// process.env.KNEX_DEBUG = true
process.env.ANNO_BASE_URL = `http://localhost:3000`
process.env.ANNO_BASE_PATH = ``
process.env.ANNO_KNEXFILE = `${__dirname}/knexfile.js`

const store = new(require('.'))()
require('tap').test(store.constructor.name, async t => {
  const StoreTests = new(require('../anno-store/store-test'))(store)
  // console.log(store)
  await StoreTests.store.init()
  // await StoreTests.testWipe(t)
  await StoreTests.testCreateGet(t)
  await StoreTests.testGetByRevId(t)
  await StoreTests.testRevise(t)
  await StoreTests.testReply(t)
  // await StoreTests.testDelete(t)
  await StoreTests.store.disconnect()
  t.end()
})
