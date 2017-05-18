const tap = require('tap')
const UserMemoryMiddleware = require('.')
process.ANNO_DEBUG = false

tap.test('pre-user-static', t => {
    const mw = UserMemoryMiddleware()
    const ctx = {user: "admin-user"}
    mw(ctx, err => {
        t.equals(err, undefined, "No error")
        t.equals(typeof ctx.user, 'object', 'user is an object now')
        t.equals(ctx.user.role, 'admin', 'role from data')
        t.end()
    })
})
