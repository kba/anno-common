const ConfigReloader = require('./config-reloader')
const StaticLoader = require('./static-loader')

const AclProcessor = require('./acl')
const UserProcessor = require('./user')

module.exports = {
    defaultRules: require('./default-rules.json'),
    AclProcessor,
    UserProcessor,
    PreAclFile: ConfigReloader(AclProcessor, 'ACL_FILE'),
    PreUserFile: ConfigReloader(UserProcessor, 'USER_FILE'),
    PreAclStatic: StaticLoader(AclProcessor, 'ACL_DATA', require('./default-rules.json')),
    PreUserStatic: StaticLoader(UserProcessor, 'USER_DATA', require('./users-example.json')),
}

