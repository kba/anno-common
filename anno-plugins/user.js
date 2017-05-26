const deepExtend = require('deep-extend')
const {RuleSet} = require('sift-rule')
const async = require('async')
const {envyLog} = require('envyconf')

const RULESET = Symbol('_ruleset')

module.exports = class UserProcessor {

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
        this.log = envyLog('ANNO', 'user')
    }

    process(ctx, cb) {
        if (!( 'user' in ctx ))
            return cb()
        const userId = typeof ctx.user === 'string' ? ctx.user
            : ctx.user.user ? ctx.user.user
            : ctx.user.id
        this.log.silly(`Looking up user ${JSON.stringify(ctx.user)}`)
        if (userId in this.users) {
            // console.log(`Found user ${userId}`, this.users[userId])
            if (typeof ctx.user === 'string') ctx.user = {id: userId}
            deepExtend(ctx.user, this.users[userId], ...this.users[userId][RULESET].filterApply(ctx))
        } else {
            // console.log(`User not found: ${userId}`)
        }
        return cb()
    }
}

module.exports.usersExample = require('./users-example.json')

