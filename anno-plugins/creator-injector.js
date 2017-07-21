const deepExtend = require('deep-extend')
const lodashSet = require('lodash.set')
const {applyToAnno} = require('@kba/anno-util')
const UserBase = require('./user-base')

const METHODS = new Set([
    'get',
    'revise',
    'create',
    'search',
])

class CreatorInjector extends UserBase {

    constructor(users={}) {
        super('creator-injector', users)
    }

    _lookupUser(user, ctx) {
        if (!user) return
        const id = typeof user === 'string' ? user
            : user.user ? user.user
            : user.id
        // this.log.silly(`Looking up user ${JSON.stringify(user)}`)
        const ret = {id}
        if (!(id in this.users))
            return ret
        // console.log(`Found user ${id}`, this.users[id])
        deepExtend(ret, this.users[id])
        this.users[id][UserBase.RULESET].filterApply(ctx).forEach(kv =>
            Object.keys(kv).forEach(k => {
                if (k.indexOf('.') > -1) {
                    // 'public.displayName: ...'
                    lodashSet(ret, k, kv[k])
                } else {
                    // 'public: {displayName: ...}'
                    deepExtend(ret, kv[k])
                }
            }))
        return ret
    }

    process(ctx, cb) {
        if (!METHODS.has(ctx.method))
            return cb()

        if ('retvals' in ctx) {
            const fn = (anno) => {
                const user = this._lookupUser(anno.creator, ctx)
                if (user && user.public) anno.creator = Object.assign(user.public, {id: user.id})
            }
            if (ctx.method === 'search') {
                for (let anno of ctx.retvals[0]) {
                    applyToAnno(anno, fn)
                }
            } else if (ctx.method === 'get') {
                applyToAnno(ctx.retvals[0], fn)
            }
        // pre-processing
        } else if (ctx.anno && ! ctx.metadataOnly && ! ctx.anno.creator && ctx.user && ctx.user.id) {
            ctx.anno.creator = ctx.user.id
        }
        return cb()
    }

}

module.exports = CreatorInjector
