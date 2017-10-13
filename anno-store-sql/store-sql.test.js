// process.env.KNEX_DEBUG = true
process.env.ANNO_BASE_URL = `http://localhost:3000`
process.env.ANNO_BASE_PATH = ``
process.env.ANNO_KNEXFILE = `${__dirname}/knexfile.js`

const store = new(require('.'))()
require('tap').test(store.constructor.name, async t => {
  const StoreTests = new(require('../anno-store/store-test'))(store)
  // t.plan(7)
  // console.log(store)
  await StoreTests.store.init()
  // await StoreTests.testWipe(t)
  // await StoreTests.testCreateGet(t)
  console.log
  await StoreTests.testCreateAll(t, [
    'anno1.json',
      // 'anno10.json',
      // 'anno11.json',
      'anno12.json',
      // 'anno13.json',
      'anno14.json',
      'anno15.json',
      'anno16.json',
      'anno17.json',
      'anno18.json',
      'anno19.json',
      'anno2.json',
      'anno20.json',
      'anno21.json',
      'anno22.json',
      'anno23.json',
      'anno24.json',
      'anno25.json',
      'anno26.json',
      'anno27.json',
      'anno28.json',
      'anno29.json',
      'anno3.json',
      'anno30.json',
      'anno31.json',
      'anno32.json',
      'anno33.json',
      'anno34.json',
      'anno35.json',
      'anno36.json',
      // 'anno37.json',
      'anno38.json',
      'anno39.json',
      'anno4.json',
      'anno40.json',
      'anno41.json',
      'anno5.json',
      'anno6.json',
      'anno7.json',
      'anno8.json',
      'anno9.json',
      'dummy_anno1.json',
      'minimal-array-target.json',
      'minimal-object-target.json',
      'minimal-string-target.json'
  ])
  // await StoreTests.testGetByRevId(t)
  // await StoreTests.testRevise(t)
  // await StoreTests.testReply(t)
  // await StoreTests.testDelete(t)
  // await StoreTests.store.disconnect()
  process.nextTick(() => {
    t.end()
    process.exit()
  })
})
