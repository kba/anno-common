const tap = require('tap')
const {prune} = require('./util')

tap.test('util', t => {
    t.deepEquals(prune({a:'', b:[], c:{}, bar:42}), {bar:42}, 'prune')
    t.end()
})
