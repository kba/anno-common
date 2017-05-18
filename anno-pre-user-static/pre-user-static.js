const UserProcessor = require('@kba/anno-user')
const {envyConf} = require('envyconf')
const {RuleSet} = require('sift-rule')

function PreUserStatic() {

    const config = envyConf('ANNO', {
        USER_DATA: JSON.stringify(UserProcessor.usersExample)
    })
    const userProcessor = new UserProcessor(JSON.parse(config.USER_DATA))
    return (ctx, cb) => userProcessor.process(ctx, cb)

}

module.exports = PreUserStatic
