const tap = require('tap')

const loadConfig = require('../src/config')

tap.test('loadConfig', t => {
    var config = loadConfig()
    t.equals(config.STORE, 'NEDB', 'config.STORE === NEDB')
    const expected = 'not secret'
    process.env.ANNO_JWT_SECRET = expected
    config = loadConfig()
    t.equals(config.JWT_SECRET, expected, 'reloading from env works')
    t.end()
})
