process.env.ANNO_DEBUG = true

// const tap = require('tap')
// const fixtures = require(__dirname + '/../testlib/schema-cases')
const HttpStore = require('./store-http')

// TODO start server

const store = new HttpStore()
console.log(store.constructor.name)
require(`${__dirname}/../testlib/store-test`)(store, (err) => {
    console.log("# store-test finished")
})

// tap.test('store-http', t => {
//     process.env.ANNO_STORE = '@kba/anno-store-http'
//     const annoToPost = fixtures.AnnotationToPost.ok[1]
//     const store = new HttpStore()
//     store.create(annoToPost, (err, saved) => {
//         t.equals(saved['@context'], 'http://www.w3.org/ns/anno.jsonld', '@context')
//         store.get(saved.id, (err, got) => {
//             t.deepEquals(saved, got, 'create/get works')
//             t.end()
//         })
//         // console.log(err, resp)
//     })
// })
