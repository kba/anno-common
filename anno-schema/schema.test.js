const fixtures = require('../testlib/schema-cases')
const tap = require('tap')
const schema = require('.')

tap.test('smoketest schema', t => {
    t.equals(Object.keys(schema.validate).length, Object.keys(schema.definitions).length, 'validate 1:1 definitions')
    t.equals(Object.keys(schema.validate).length, 31, '31 classes in schema')
    t.end()
})

Object.keys(fixtures).forEach(type => {
    const cases = fixtures[type]
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
