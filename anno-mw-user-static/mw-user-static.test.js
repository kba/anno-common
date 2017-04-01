const tap = require('tap')
const UserMemoryMiddleware = require('./mw-user-static')
process.ANNO_DEBUG = false

tap.test('mw-user-data', t => {
    const mw = UserMemoryMiddleware()
    const ctx = {user: "admin-user"}
    mw(ctx, err => {
        t.equals(err, undefined, "No error")
        t.equals(typeof ctx.user, 'object', 'user is an object now')
        t.equals(ctx.user.role, 'admin', 'role from data')
        t.end()
    })
})
