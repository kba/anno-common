const {RuleSet} = require('sift-rule')
const defaultRules = require('./default-rules.json')
const usersExample = require('./users-example.json')

class AnnoAclRules {

    constructor({rules, users}={}) {
        const config = require('@kba/anno-config').loadConfig({
            ACL_RULES: JSON.stringify(defaultRules),
            ACL_USERS: JSON.stringify(usersExample)
        })
        if (!rules) rules = JSON.parse(config.ACL_RULES)
        this.rules = new RuleSet(rules)
        if (!users) users = JSON.parse(config.ACL_USERS)
        Object.keys(users).forEach(id => {
            if (!users[id].id) users[id].id = id
            // TODO aliases
        })
        this.users = users
    }

    check(ctx, cb) {
        ctx.collection = (ctx.collection || 'default')
        if (typeof ctx.user === 'string' && ctx.user in this.users) {
            ctx.user = this.users[ctx.user]
        } else if (typeof ctx.user === 'object' && ctx.user.id in this.users) {
            Object.assign(ctx.user, this.users[ctx.user.id])
        }

        const matchingRule = this.rules.first(ctx)
        if (process.env.ANNO_DEBUG == 'true') {
            console.log(`Rule '${matchingRule}' matched ${JSON.stringify(ctx)}`)
        }
        this.reason = matchingRule.name
        if (matchingRule.tail)
            return cb(null, matchingRule.name)
        else
            return cb(matchingRule.name)
    }

}

module.exports = AnnoAclRules
