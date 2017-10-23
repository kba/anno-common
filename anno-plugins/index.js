const {StaticLoader, ConfigReloader} = require('@kba/anno-util-loaders')

const AclProcessor        = require('./acl')
const UserProcessor       = require('./user')
const CollectionProcessor = require('./collection')
const CreatorInjector     = require('./creator-injector')

module.exports = {
    defaultRules: require('./default-rules.json'),
    AclProcessor,
    UserProcessor,

    PreCollectionFile:     ConfigReloader(CollectionProcessor, 'COLLECTION_FILE'),
    PreCollectionStatic:   StaticLoader(CollectionProcessor,   'COLLECTION_DATA',   require('./collections.json')),

    PreAclFile:            ConfigReloader(AclProcessor,        'ACL_FILE'),
    PreAclStatic:          StaticLoader(AclProcessor,          'ACL_DATA',   require('./default-rules.json')),

    PreUserFile:           ConfigReloader(UserProcessor,       'USER_FILE'),
    PreUserStatic:         StaticLoader(UserProcessor,         'USER_DATA',  require('./users-example.json')),

    CreatorInjectorFile:   ConfigReloader(CreatorInjector,     'USER_FILE'),
    CreatorInjectorStatic: StaticLoader(CreatorInjector,       'USER_DATA',  require('./users-example.json')),
}

