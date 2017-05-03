const {RuleSet} = require('sift-rule')
const {acl, defaultRules} = require('@kba/anno-acl')
const {envyConf} = require('envyconf')

class AclStatic extends acl {

    constructor() {
        super()
        const config = envyConf('ANNO', {
            ACL_RULES: JSON.stringify(defaultRules),
        })
        this.rules = new RuleSet(JSON.parse(config.ACL_RULES))
    }
}

module.exports = function () {
    const instance = new AclStatic()
    return function AclStaticMiddleware(...args) {
        return instance.process(...args)
    }
}
