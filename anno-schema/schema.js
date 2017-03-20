const ajv = require('ajv')({
    allErrors: true
});
const config = require('@kba/anno-config').loadConfig({
    // PROP_HAS_REPLY: 'hasReply',
    // PROP_REPLY_TO: 'replyTo',
    // // PROP_HAS_COMMENT: 'ns:hasReview',
    // PROP_HAS_VERSION: 'http://purl.org/dcterms/hasVersion',
    // // PROP_HAS_VERSION: 'ns:hasVersion',
    // PROP_VERSION_OF: 'http://purl.org/dcterms/versionOf',
    // // PROP_VERSION_OF: 'ns:versionOf',
})

const schemaDef = require('./schema.json')

module.exports = {
    definitions: schemaDef.definitions,
    validate: {},
    jsonldContext:{
        '@context': [
            'http://www.w3.org/ns/anno.jsonld',
            {
                annox: 'https://github.com/kba/anno/context.jsonld',
                rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
                sioc: 'http://rdfs.org/sioc/ns#',
                AnnotationReply: {
                    '@id': 'annox:AnnotationReply',
                    'rdfs:subClassOf': 'oa:Annotation',
                },
                hasReply: {
                    '@id': 'annox:hasReply',
                    '@type': "@id",
                    'rdfs:subClassOf': "sioc:has_reply",
                    'rdfs:domain': "oa:Annotation",
                    'rdfs:range': "annox:AnnotationComment",
                    'owl:inverseOf': { '@id': "hasReply" }
                },
                replyTo: {
                    '@id': "annox:replyTo",
                    '@type': "@id",
                    'rdfs:subClassOf': "sioc:reply_to",
                    'rdfs:domain': "annox:AnnotationComment",
                    'rdfs:range': "oa:Annotation",
                    'owl:inverseOf': { '@id': "replyTo" }
                },
                hasVersion: {
                    '@id': "http://purl.org/pav/hasVersion",
                    '@type': "@id"
                },
                versionOf: {
                    '@id': "annox:versionOf",
                    '@type': "@id",
                    'owl:inverseOf': { '@id': "hasVersion" }
                },
            },
        ],
    },
}

Object.keys(schemaDef.definitions).forEach(k => {
    const thisSchema = JSON.parse(JSON.stringify(schemaDef.definitions[k]))
    thisSchema.definitions = JSON.parse(JSON.stringify(schemaDef.definitions))
    module.exports.validate[k] = ajv.compile(thisSchema)
})
