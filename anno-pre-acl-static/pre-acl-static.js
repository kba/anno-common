const {acl, defaultRules} = require('@kba/anno-acl')
const {envyConf} = require('envyconf')

module.exports = function () {
    const config = envyConf('ANNO', {
        ACL_DATA: JSON.stringify(defaultRules),
    })

    const instance = new acl(JSON.parse(config.ACL_DATA))
    return function PreAclStatic(...args) {
        return instance.process(...args)
    }
}
