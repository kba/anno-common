process.ANNO_DEBUG = false

module.exports = {
    testUser(tap, proc) {
        tap.test('admin-user', t => {
            const ctx = {user: "admin-user"}
            proc(ctx, err => {
                t.equals(err, undefined, "No error")
                t.equals(typeof ctx.user, 'object', 'user is an object now')
                t.equals(ctx.user.role, 'admin', 'role from data')
                t.end()
            })
        })

        tap.test('admin-user@l33tsp34k', t => {
            const ctx = {user: {id: "admin-user"}, collection: 'l33tsp34k'}
            proc(ctx, err => {
                t.equals(ctx.user.public.displayName, '4dm33n', 'collection-specific username')
                t.end()
            })
        })

        tap.test('admin-user@l33tsp34k / icon (rules are additive)', t => {
            const ctx = {user: {id: "admin-user"}, collection: 'l33tsp34k'}
            proc(ctx, err => {
                t.equals(ctx.user.public.displayName, '4dm33n', 'collection-specific username')
                t.equals(ctx.user.public.icon, 'ICON1', 'collection-specific icon')
                t.end()
            })
        })

        tap.test('mike@test-collection', t => {
            const ctx = {user: "mike", collection: 'test-collection'}
            proc(ctx, err => {
                t.equals(ctx.user.role, 'moderator', 'mike is moderator in test-collectino')
                t.end()
            })
        })

        tap.test('spambot3000', t => {
            const ctx = {user: "spambot3000"}
            proc(ctx, err => {
                t.equals(ctx.user.inactive, true, 'is inactive')
                t.end()
            })
        })
    }
}
