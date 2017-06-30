const deepExtend = require('deep-extend')
const {RuleSet} = require('sift-rule')
const async = require('async')
const lodashSet = require('lodash.set')
const {envyLog} = require('envyconf')
const {applyToAnno} = require('@kba/anno-util')

const RULESET = Symbol('_ruleset')

const METHODS = new Set([
    'get',
    'search',
])

module.exports = class CreatorInjector {

    constructor(users={}) {
        // TODO validate
        Object.keys(users).forEach(id => {
            if (!users[id].id) {
                users[id].id = id
            }
            users[id][RULESET] = new RuleSet({name: `Rules for user ${id}`, rules: users[id].rules || []})
            delete users[id].rules
        })
        this.users = users
        this.log = envyLog('ANNO', 'creator-injector')
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
        this.users[id][RULESET].filterApply(ctx).forEach(kv =>
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
        if (!( 'retvals' in ctx ))
            return cb()
        if (!METHODS.has(ctx.method))
            return cb()

        const fn = (anno) => {
            const user = this._lookupUser(anno.creator, ctx)
            if (user && user.public) anno.creator = Object.assign(user.public, {id: user.id})
        }
        if (ctx.method === 'search') {
            for (let anno of ctx.retvals[0]) {
                applyToAnno(anno, fn)
            }
        } else {
            applyToAnno(ctx.retvals[0], fn)
        }
        return cb()
    }

}
