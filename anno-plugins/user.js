const deepExtend = require('deep-extend')
const {RuleSet} = require('sift-rule')
const {envyLog} = require('envyconf')
const UserBase = require('./user-base')

class UserProcessor extends UserBase {

    constructor(users={}) {
        super('user-processor', users)
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
            const ruleResults = this.users[id][UserBase.RULESET].filterApply(ctx)
            deepExtend(ctx.user, {id}, this.users[id], ...ruleResults)
        } else {
            // console.log(`User not found: ${id}`)
        }
        return cb()
    }
}

module.exports = UserProcessor
module.exports.usersExample = require('./users-example.json')

