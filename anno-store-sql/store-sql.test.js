process.env.ANNO_BASE_URL = `http://localhost:3000`
process.env.ANNO_BASE_PATH = ``
process.env.ANNO_KNEXFILE = `${__dirname}/knexfile.js`

const tap = require('tap')
const store = new(require('./store-sql'))()
const StoreTests = new(require('../anno-store/store-test'))(store)

tap.test(async t => {
  console.log(store)
  await StoreTests.testWipe(t, store)
  t.end()
})
