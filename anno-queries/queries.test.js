const tap = require('tap')
const fixtures = require('@kba/anno-fixtures').Annotation.ok
const queries = require('./queries')

const ok = {
    textualHtmlBody:       ['anno5.json'],
    svgSelectorResource:   ['anno30.json'],
    mediaFragmentResource: ['anno23.json'],
}

tap.test('fixture tests', t => {
    Object.keys(ok).forEach(query => {
        ok[query].forEach(fixture => {
            const pass = queries[query].first(fixtures[fixture])
            // if (!pass) {
                // console.error(JSON.stringify(fixtures[fixture], null, 2))
            // }
            t.ok(pass, `${fixture} has a ${query}`)
        })
    })
    t.end()
})

// console.log(JSON.stringify(fixtures, null, 2));
