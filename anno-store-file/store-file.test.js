process.env.ANNO_BASE_URL = `http://localhost:3000`
process.env.ANNO_BASE_PATH = ``
process.env.ANNO_NEDB_DIR = `${__dirname}/../temp`

const store = new(require('.'))()
require('tap').test(store.constructor.name, async t => {
  const StoreTests = new(require('../anno-store/store-test'))(store)

  await StoreTests.store.init()
  await StoreTests.testAll(t)
  // await StoreTests.testWipe()
  // await StoreTests.testCreateGet()
  // await StoreTests.testSearch()
  // await StoreTests.testRevise()
  // await StoreTests.testDelete(t)
  // await StoreTests.testImport(t)
  await StoreTests.store.disconnect()

  t.end()
})
