const mustache = require('mustache')
const ajv = require('ajv')({
    allErrors: true,
    // errorDataPath: true,
    // verbose: true,
});
const config = require('@kba/anno-config').loadConfig({
    CONTEXT_URL: 'https://kba.github.io/anno/context.jsonld',

    // Swagger / OpenAPI
    OPENAPI_HOST: 'localhost:3000',
    OPENAPI_BASEPATH: '/',
    OPENAPI_PATH: 'anno',

    // PROP_HAS_REPLY: 'hasReply',
    // PROP_REPLY_TO: 'replyTo',
    // // PROP_HAS_COMMENT: 'ns:hasReview',
    // PROP_HAS_VERSION: 'http://purl.org/dcterms/hasVersion',
    // // PROP_HAS_VERSION: 'ns:hasVersion',
    // PROP_VERSION_OF: 'http://purl.org/dcterms/versionOf',
    // // PROP_VERSION_OF: 'ns:versionOf',
})

function mustacheJSON(obj) {
    return JSON.parse(mustache.render(JSON.stringify(obj), {config}))
}

const dataModel     = mustacheJSON(require('./data-model.json'))
const jsonldContext = mustacheJSON(require('./context.json'))
const openapi       = mustacheJSON(require('./openapi.json'))
openapi.definitions = dataModel.definitions

module.exports = {
    openapi: openapi,
    definitions: dataModel.definitions,
    jsonldContext: jsonldContext,
    contentType: {
        'anno':  'application/ld+json;profile="http://www.w3.org/ns/anno.jsonld"',
        'annox': 'application/ld+json;profile="http://www.w3.org/ns/anno.jsonld"',
    },
    validate: {},
}

Object.keys(dataModel.definitions).forEach(k => {
    const thisSchema = JSON.parse(JSON.stringify(dataModel.definitions[k]))
    thisSchema.definitions = JSON.parse(JSON.stringify(dataModel.definitions))
    module.exports.validate[k] = ajv.compile(thisSchema)
})
