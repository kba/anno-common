const async = require('async')
const tap = require('tap')
const fixtures = require('./schema-cases')

const input1 = fixtures.AnnotationToPost.ok[0]
const oldTarget = input1.target
const newTarget = 'https://foo.example.bar'
const input2 = fixtures.AnnotationToPost.ok[1]
const input3 = fixtures.AnnotationToPost.ok[2]
const input4 = {target: 'x://y', body: {type: ['oa:Tag']}}
var savedId;
var savedRevId;

function testWipe(t, store, done) {
    t.comment("init/wipe/init")
    async.waterfall([
        cb => store.init(cb),
        cb => store.wipe(cb),
        cb => store.init(cb),
    ], (err) => {
        t.notOk(err, "init/wipe/init success")
        return done(err)
    })
}

function testCreateGet(t, store, done) {
    t.comment("create/get")
    async.waterfall([
        cb => store.create(input1, cb),
        (saved, cb) => {
            t.equals(saved.target.source, input1.target, 'target kept (string)')
            savedId = saved.id
            savedRevId = `${savedId}-rev-1`
            cb()
        },
        cb => store.get(savedId, cb),
        (found, cb) => {
            t.equals(found.id, savedId, `get by url: ${savedId}`)
            cb()
        },
        cb => store.get(savedRevId, cb),
        (found, cb) => {
            t.equals(found.id, savedRevId, `get by revision-id: ${savedRevId}`)
            cb()
        },
        cb => store.get('DOES-NOT-EXIST', (err) => {
            t.equals(err.code, 404, "DOES-NOT-EXIST isnt found")
            cb()
        }),
        cb => store.create(input2, cb),
        (saved, cb) => {
            t.equals(saved.target.source, input2.target.source, 'target kept (object)')
            cb()
        },
        cb => store.create(input3, cb),
        (saved, cb) => {
            t.equals(saved.target.source, input3.target[0].source, 'target kept (array of objects)')
            cb()
        },
        cb => store.create(input4, cb),
        (saved, cb) => {
            t.equals(saved.target.source, input4.target, 'target kept (string)')
            cb()
        },
    ], (err) => {
        t.notOk(err, "create/get worked")
        return done(err)
    })
}

function testRevise(t, store, done) {
    t.comment("revise")
    async.waterfall([
        cb => {
            input1.target = newTarget
            store.revise(savedId, input1, cb)
        },
        (revised, cb) => {
            const revisedRevId = savedRevId.replace(/1$/, '2')
            t.equals(revised.id, revisedRevId, `revised revision-id: ${revisedRevId}`)
            t.equals(revised.target.source, newTarget, 'target updated')
            cb()
        },
    ], (err) => {
        t.notOk(err, "revise worked")
        return done(err)
    })
}

function testSearch(t, store, done) {
    t.comment("search")
    async.waterfall([
        cb => store.search(cb),
        (annos, cb) => {
            t.equals(annos.length, 4, '4 anno in store total')
            cb()
        },
        cb => store.search({$target: input1.target}, cb),
        (annos, cb) => {
            // console.log(annos.map(x => x.target))
            t.equals(annos.length, 1, `search {$target:${input1.target} -> 1`)
            cb()
        },
        // TODO how to serialize this in a GET call?
        // cb => store.search({'target.source': {$in: [oldTarget, newTarget]}}, cb),
        // (annos, cb) => {
        //     t.equals(annos.length, 3, `search {target.source: {$in: ${JSON.stringify([oldTarget, newTarget])}}} -> 3`)
        //     cb()
        // },
    ], (err) => {
        t.notOk(err, "search worked")
        return done(err)
    })
}

function testDelete(t, store, done) {
    t.comment("delete")
    async.waterfall([
        cb => store.delete(savedId, cb),
        cb => store.search(cb),
        (annos, cb) => {
            t.equals(annos.length, 3, '3 anno after delete')
            cb()
        },
    ], (err) => {
        t.notOk(err, "delete worked")
        return done(err)
    })
}

module.exports = function testStore(store, testStoreCallback) {
    tap.test(`store-test / ${store.constructor.name}`, t => {
        async.waterfall([
            cb => testWipe(t, store, cb),
            cb => testCreateGet(t, store, cb),
            cb => testRevise(t, store, cb),
            cb => testSearch(t, store, cb),
            cb => testDelete(t, store, cb),
            cb => store.disconnect(cb),
        ], (err) => {
            if (err) t.fail(err);
            t.end()
            return testStoreCallback()
        })
    })
}
