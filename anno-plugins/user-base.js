const {envyLog} = require('envyconf')
const {RuleSet} = require('sift-rule')

const RULESET = Symbol('_ruleset')

module.exports = class UserBase {

    constructor(name, users={}) {

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
        this.log = envyLog('ANNO', name)
    }

}
module.exports.RULESET = RULESET
