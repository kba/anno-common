const tap = require('tap')
const schema = require('.')
const fs = require('fs')

tap.test('smoketest', t => {
    t.equals(Object.keys(schema.validate).length, Object.keys(schema.definitions).length, 'validate 1:1 definitions')
    t.equals(Object.keys(schema.validate).length, 31, '31 classes in schema')
    t.end()
})

function loadFixtures(store, cb) {
    const fixtureDir = `${__dirname}/../fixtures/`
    const ret = {
        Annotation: {
            ok: {},
            notOk: {},
        }
    }
    const files = fs.readdirSync(fixtureDir)
    files.filter(_ => _.match(/\.json$/)).forEach(file => {
        ret.Annotation.ok[file] = JSON.parse(fs.readFileSync(`${fixtureDir}/${file}`))
    })
    return ret
}


const fixtures = loadFixtures()
Object.keys(fixtures).forEach(type => {
    const cases = fixtures[type]
    const okKeys = Object.keys(cases.ok)
    const notOkKeys = Object.keys(cases.notOk)
    tap.test(type, t => {
        const valid = schema.validate[type]
        t.plan(okKeys.length + notOkKeys.length)
        okKeys.forEach(k => {
            t.ok(valid(cases.ok[k]), `Valid ${type}: ${k}`)
            if (valid.errors) console.log(JSON.stringify(valid.errors, null, 2).replace(/^/m, '  # '))
        })
        notOkKeys.forEach(k => {
            t.notOk(valid(cases.notOk[k]), `Not a valid ${type}: ${k}`)
        })
    })
})
