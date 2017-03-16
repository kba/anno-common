process.env.ANNO_DEBUG = true

const tap = require('tap')
const fixtures = require(__dirname + '/../fixtures/schema-cases')
const HttpStore = require('./store-http')

// TODO start server

tap.test('store-http', t => {
    process.env.ANNO_STORE = '@kba/anno-store-http'
    const store = new HttpStore()
    store.create(fixtures.AnnotationToPost.ok[1], (err, resp) => {
        console.log(err, resp)
        t.end()
    })
})
