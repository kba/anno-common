// XXX start server before
// process.env.ANNO_DEBUG = true

const HttpStore = require('./store-http')

const store = new HttpStore()
console.log(store.constructor.name)
require(`${__dirname}/../testlib/store-test`)(store, (err) => {
    console.log("# store-test finished")
})
