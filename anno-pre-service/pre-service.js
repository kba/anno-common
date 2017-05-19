const UserProcessor = require('@kba/anno-user')
const {envyConf} = require('envyconf')
const {RuleSet} = require('sift-rule')

function PreService() {

    return (ctx, cb) => {
        if (ctx.service === 'diglit') {
            // TODO take the service and targetSource into account and deduce aclData from it to be used for authorization
            // XXX What's the target
        }
        return cb()
    }

}

module.exports = PreService
