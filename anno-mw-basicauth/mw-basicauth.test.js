const tap = require('tap')
const BasicAuthMiddleware = require('./mw-basicauth')

tap.test('basicauth', t => {
    process.env.ANNO_BASICAUTH_PASSWORD = 'passw0rd'
    process.env.ANNO_BASICAUTH_USERNAME = 'john'
    const mw = new BasicAuthMiddleware()
    const ctx = {}
    mw(ctx, (err) => {
        t.deepEquals(ctx, {auth:{username:'john',password:'passw0rd'}}, 'auth set')
        t.end()
    })
})

tap.test('basicauth error', t => {
    delete process.env.ANNO_BASICAUTH_USERNAME
    const mw = new BasicAuthMiddleware()
    const ctx = {}
    mw(ctx, (err) => {
        t.ok(err, 'should throw if username not set')
        t.end()
    })
})
