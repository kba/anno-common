const errors = require('@kba/anno-errors')
const {envyConf} = require('envyconf')

module.exports = function AnnoOptionsMiddleware() {
    const conf = envyConf('ANNO', {
        DEFAULT_COLLECTION: 'default',
        COLLECTION_DATA: JSON.stringify({default:{secret:'123'}}),
    })
    const collectionConfig = JSON.parse(conf.COLLECTION_DATA)

    return function optionsFromRequest(req, resp, next) {

        req.annoOptions = req.annoOptions || {}

        const options = req.annoOptions

        // Determine collection from header
        const collection = req.header('x-anno-collection') || conf.DEFAULT_COLLECTION
        if (!(collection in collectionConfig)) {
            return next(errors.badRequest(`No such collection: '${collection}'`))
        }
        options.collection = collection

        // boolean values
        ;['skipVersions', 'skipReplies', 'metadataOnly'].forEach(option => {
            if (option in req.query) {
                options[option] = !! req.query[option].match(/^(true|1)$/)
                delete req.query[option]
            }
        })

        // https://www.w3.org/TR/annotation-protocol/#suggesting-an-iri-for-an-annotation
        if (req.header('slug')) options.slug = req.header('slug')

        console.log("annoOptions scraped", options)
        next()
    }
}
