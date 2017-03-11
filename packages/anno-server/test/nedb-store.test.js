process.env.ANNO_NEDB_DIR = `${__dirname}/../temp`

const async = require('async')
const tap = require('tap')
const NedbStore = require('../src/store/nedb-store')
const fixtures = require('./fixtures/schema-cases')

tap.test('nedb-store', t => {
    const input1 = fixtures.AnnotationToPost.ok[0]
    const input2 = fixtures.AnnotationToPost.ok[1]
    const input3 = fixtures.AnnotationToPost.ok[2]
    const input4 = {target: 'x://y', body: {type: ['oa:Tag']}}
    const store = new NedbStore()
    async.waterfall([
        cb => store.wipe(cb),
        cb => store.create(input1, (err, saved) => {
            t.equals(saved.target, input1.target, 'target kept')
            cb()
        }),
        cb => store.create(input2, cb),
        (saved, cb) => {
            t.equals(saved.target.source, input2.target.source, 'target kept')
            cb()
        },
        cb => store.create(input3, cb),
        (saved, cb) => {
            t.equals(saved.target[0].source, input3.target[0].source, 'target kept')
            cb()
        },
        cb => store.create(input4, cb),
        (saved, cb) => {
            t.equals(saved.target, input4.target, 'target kept')
            cb()
        },
        cb => store.search(cb),
        (annos, cb) => {
            t.equals(annos.length, 4, '4 anno in store')
            cb()
        },
        cb => store.search({$target: input1.target}, cb),
        (annos, cb) => {
            t.equals(annos.length, 3, 'search/$target -> 3')
            cb()
        },
    ], (err) => {
        if (err) t.fail(err);
        t.end();
    })
})
