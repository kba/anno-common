const tap = require('tap')
const schema = require('../src/schema')

tap.test('smoketest schema', t => {
    t.equals(Object.keys(schema.validate).length, Object.keys(schema.definitions).length, 'validate 1:1 definitions')
    t.equals(Object.keys(schema.validate).length, 10, '10 classes in schema')
    t.end()
})

const allCases = {
    AnnotationToPost: {
        notOk: [
            {
                id: 'foo',
                body: {type: ['oa:Tag']},
                target: 'x://foo',
            },
        ],
        ok: [
            {
                body: {type: ['oa:Tag']},
                target: 'x://foo',
            },
            {
                body: {type: ['oa:Tag']},
                target: {source: 'x://foo'},
            },
            {
                body: {type: ['oa:Tag']},
                target: [{source: 'x://foo'}],
            },
        ],
    },
    FullAnnotation: {
        notOk: [
            {},
            {
                id: 'http://foo',
                body: {},
                target: [],
                created: '2010-01-01T00:00:00Z',
                creator: 'x@y',
                hasReply: [],
            },
        ],
        ok: []
    }
}

Object.keys(allCases).forEach(type => {
    const cases = allCases[type]
    tap.test(type, t => {
        const valid = schema.validate[type]
        t.plan(cases.ok.length + cases.notOk.length)
        cases.ok.forEach(obj => {
            t.ok(valid(obj), `Valid ${type}: ${JSON.stringify(obj)}`)
            if (valid.errors) console.log(valid.errors)
        })
        cases.notOk.forEach(obj => {
            t.notOk(valid(obj), `Not a valid ${type}: ${JSON.stringify(obj)}`)
        })
    })
})
