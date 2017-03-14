const yaml = require('js-yaml')
const fs = require('fs')
const ajv = require('ajv')({
    allErrors: true
});
const config = require('@kba/anno-config').loadConfig({
    // const PROP_HAS_COMMENT = 'http://purl.org/stuff/rev#hasReview'
    PROP_HAS_COMMENT: 'ns:hasReview',
    // const PROP_HAS_VERSION = 'http://purl.org/dcterms/hasVersion'
    PROP_HAS_VERSION: 'ns:hasVersion',
    // const PROP_VERSION_OF: 'http://purl.org/dcterms/versionOf'
    PROP_VERSION_OF: 'ns:versionOf',
})

const schemaDef = yaml.safeLoad(fs.readFileSync(`${__dirname}/schema.yml`))

module.exports = {
    definitions: schemaDef.definitions,
    validate: {},
    jsonldContext: [
        'http://www.w3.org/ns/anno.jsonld',
        {
            'AnnotationReply': {
            },
            'hasVersion': config.PROP_HAS_VERSION,
            'versionOf': config.PROP_VERSION_OF,
            'replyTo': config.PROP_REPLY_TO,
        }
    ],
}

Object.keys(schemaDef.definitions).forEach(k => {
    const thisSchema = JSON.parse(JSON.stringify(schemaDef.definitions[k]))
    thisSchema.definitions = JSON.parse(JSON.stringify(schemaDef.definitions))
    module.exports.validate[k] = ajv.compile(thisSchema)
})
