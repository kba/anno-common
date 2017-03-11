const tap = require('tap')

const loadConfig = require('../src/config')

tap.test('loadConfig', t => {
    var config = loadConfig()
    t.equals(config.STORE, 'NEDB', 'config.STORE === NEDB')

    const expected = 'not secret'
    process.env.ANNO_JWT_SECRET = expected
    config = loadConfig()
    t.equals(config.JWT_SECRET, expected, 'reloading from env works')

    process.env.ANNO_FOO = expected
    config = loadConfig()
    t.equals(config.FOO, expected, 'picking up unknown vars works')

    config = loadConfig({BLA: expected})
    t.equals(config.BLA, expected, 'localDefaults works')

    process.env.ANNO_BLA = '42'
    config = loadConfig({BLA: expected})
    t.equals(config.BLA, '42', 'env overrides localDefaults')

    config = loadConfig({XYZ: expected})
    t.equals(process.env.ANNO_XYZ, expected, 'config vars are exported to env')
    t.end()
})
