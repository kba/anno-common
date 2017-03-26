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

const dataModel = require('./data-model.json')
const jsonldContext = require('./context.json')
// TODO mustache
// const swaggerDef = yaml.safeLoad(mustache.render(
//     fs.readFileSync(__dirname + '/../../swagger-schema.yml', {encoding: 'utf-8'}),
//     {config}))
const openapi = require('./openapi.json')
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
