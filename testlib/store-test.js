const async = require('async')
const tap = require('tap')
const fixtures = require('./schema-cases')

module.exports = function testStore(store) {
    tap.test(`store-test: ${store.constructor.name}`, t => {
        const input1 = fixtures.AnnotationToPost.ok[0]
        const oldTarget = input1.target
        const newTarget = 'https://foo.example.bar'
        const input2 = fixtures.AnnotationToPost.ok[1]
        const input3 = fixtures.AnnotationToPost.ok[2]
        const input4 = {target: 'x://y', body: {type: ['oa:Tag']}}
        var savedId;
        var savedRevId;
        var savedRevId2;
        async.waterfall([
            cb => store.wipe(cb),
            cb => store.init(cb),
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
            cb => {
                t.comment("Test revise")
                input1.target = newTarget
                store.revise(savedId, input1, cb)
            },
            (revised, cb) => {
                // console.log(revised)
                const revisedRevId = savedRevId.replace('1', '2')
                t.equals(revised.id, revisedRevId, `revised revision-id: ${revisedRevId}`)
                t.equals(revised.target.source, newTarget, 'target updated')
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
            cb => {
                t.comment("Test search")
                store.search(cb)
            },
            (annos, cb) => {
                // console.log(annos.map(x => x.target))
                t.equals(annos.length, 4, '4 anno in store total')
                cb()
            },
            cb => store.search({$target: input1.target}, cb),
            (annos, cb) => {
                // console.log(annos.map(x => x.target))
                t.equals(annos.length, 1, `search {$target:${input1.target} -> 1`)
                cb()
            },
            cb => store.search({'target.source': {$in: [oldTarget, newTarget]}}, cb),
            (annos, cb) => {
                t.equals(annos.length, 3, `search {target.source: {$in: ${JSON.stringify([oldTarget, newTarget])}}} -> 3`)
                cb()
            },
        ], (err) => {
            if (err) t.fail(err);
            t.end();
        })
    })
}
