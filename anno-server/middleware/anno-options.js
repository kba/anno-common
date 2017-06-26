const errors = require('@kba/anno-errors')
const {envyConf} = require('envyconf')

module.exports = function AnnoOptionsMiddleware() {
    const conf = envyConf('ANNO', {
        DEFAULT_COLLECTION: 'default',
        STORE_HOOKS_OPTIONS: '',
    })

    function AnnoOptionsMiddleware(req, resp, next) {

        req.annoOptions = req.annoOptions || {}

        const options = req.annoOptions

        // XXX Prevent users slipping collectionConfig by us
        delete options.collectionConfig

        // Determine collection from header
        options.collection = req.header('x-anno-collection') || conf.DEFAULT_COLLECTION
        async.eachSeries(this.hooks.pre, (proc, next) => {
            proc(ctx, (...args) => {
                this.__logContext(`After preproc ${proc.impl}`, ctx)
                next(...args)
            })
        }, (err, pass) => {

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
    AnnoOptionsMiddleware.unless = require('express-unless')
    return AnnoOptionsMiddleware
}
