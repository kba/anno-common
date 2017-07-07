const deepExtend = require('deep-extend')
const {RuleSet} = require('sift-rule')
const async = require('async')
const {envyLog} = require('envyconf')

const RULESET = Symbol('_ruleset')

module.exports = class UserProcessor {

    constructor(users={}) {
        const built = {}
        // TODO validate
        Object.keys(users).forEach(id => {
            const userDesc = users[id]
            if (!userDesc.id) userDesc.id = id
            userDesc[RULESET] = new RuleSet({name: `Rules for user ${id}`, rules: userDesc.rules || []})
            delete userDesc.rules

            if (Array.isArray(userDesc.alias))
                userDesc.alias.forEach(alias => built[alias] = userDesc)
            else if (typeof userDesc === 'string' && userDesc.match(/[a-z]+/))
                built[userDesc.alias] = userDesc
            delete userDesc.alias
            built[id] = userDesc
        })
        this.users = built
        this.log = envyLog('ANNO', 'user')
    }

    process(ctx, cb) {
        if (!( 'user' in ctx ))
            return cb()
        const id = typeof ctx.user === 'string' ? ctx.user
            : ctx.user.user ? ctx.user.user
            : ctx.user.id
        //this.log.silly(`Looking up user ${JSON.stringify(ctx.user)}`)
        if (id in this.users) {
            // console.log(`Found user ${id}`, this.users[id])
            if (typeof ctx.user === 'string') ctx.user = {}
            deepExtend(ctx.user, {id}, this.users[id], ...this.users[id][RULESET].filterApply(ctx))
        } else {
            // console.log(`User not found: ${id}`)
        }
        return cb()
    }
}

module.exports.usersExample = require('./users-example.json')

