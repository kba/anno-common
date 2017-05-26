const {StaticLoader, ConfigReloader} = require('@kba/anno-util-loaders')

const AclProcessor = require('./acl')
const UserProcessor = require('./user')
const CreatorInjector = require('./creator-injector')

module.exports = {
    defaultRules: require('./default-rules.json'),
    AclProcessor,
    UserProcessor,

    PreAclFile:            ConfigReloader(AclProcessor,    'ACL_FILE'),
    PreAclStatic:          StaticLoader(AclProcessor,      'ACL_DATA',   require('./default-rules.json')),

    PreUserFile:           ConfigReloader(UserProcessor,   'USER_FILE'),
    PreUserStatic:         StaticLoader(UserProcessor,     'USER_DATA',  require('./users-example.json')),

    CreatorInjectorFile:   ConfigReloader(CreatorInjector, 'USER_FILE'),
    CreatorInjectorStatic: StaticLoader(CreatorInjector,   'USER_DATA',  require('./users-example.json')),
}

