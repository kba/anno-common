const ajv = require('ajv')({
    allErrors: true
});
const config = require('@kba/anno-config').loadConfig({
    CONTEXT_URL: 'https://kba.github.io/anno/context.jsonld',
    // PROP_HAS_REPLY: 'hasReply',
    // PROP_REPLY_TO: 'replyTo',
    // // PROP_HAS_COMMENT: 'ns:hasReview',
    // PROP_HAS_VERSION: 'http://purl.org/dcterms/hasVersion',
    // // PROP_HAS_VERSION: 'ns:hasVersion',
    // PROP_VERSION_OF: 'http://purl.org/dcterms/versionOf',
    // // PROP_VERSION_OF: 'ns:versionOf',
})

const schemaDef = require('./schema.json')
const jsonldContext = require('./context.json')

module.exports = {
    definitions: schemaDef.definitions,
    jsonldContext: jsonldContext,
    contentType: {
        'anno':  'application/ld+json;profile="http://www.w3.org/ns/anno.jsonld"',
        'annox': 'application/ld+json;profile="http://www.w3.org/ns/anno.jsonld"',
    },
    validate: {},

}

Object.keys(schemaDef.definitions).forEach(k => {
    const thisSchema = JSON.parse(JSON.stringify(schemaDef.definitions[k]))
    thisSchema.definitions = JSON.parse(JSON.stringify(schemaDef.definitions))
    module.exports.validate[k] = ajv.compile(thisSchema)
})
