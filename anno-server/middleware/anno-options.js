const errors = require('@kba/anno-errors')
const {envyConf} = require('envyconf')
const {loadPlugins} = require('@kba/anno-util-loaders')

module.exports = function AnnoOptionsMiddleware(cb) {
    const conf = envyConf('ANNO', {
        DEFAULT_COLLECTION: 'default',
        MIDDLEWARE_PLUGINS: '',
    })

    var collectionProcessor = function(ctx, cb) {
        console.log('No collectionProcessor defined')
        return cb()
    };

    function AnnoOptionsMiddleware(req, resp, next) {

        req.annoOptions = req.annoOptions || {}

        const options = req.annoOptions

        // Determine collection from header
        options.collection = req.header('x-anno-collection') || conf.DEFAULT_COLLECTION

        // XXX Prevent users slipping collectionConfig by us
        collectionProcessor(options, err => {
            if (err) return next(err)

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
        })
    }

    AnnoOptionsMiddleware.unless = require('express-unless')

    loadPlugins(conf.MIDDLEWARE_PLUGINS, {
        loadingModule: module,
        afterLoad(plugin, loaded) {
            collectionProcessor = plugin
            loaded()
        }
    }, cb(null, AnnoOptionsMiddleware))

    return AnnoOptionsMiddleware
}
