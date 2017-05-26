const errors = require('@kba/anno-errors')
const jwt = require('jsonwebtoken')
const axios = require('axios')
const {envyConf} = require('envyconf')
const cacheManager = require('cache-manager')
const _caches = {}

function cached(metadataEndpoint, collection, context, cb) {
    const cache = (collection in _caches)
        ? _caches[collection]
        : cacheManager.caching({store: 'memory', max: 1000, ttl: 60 * 60 * 12})
    return cache.wrap(context, function() {
        return new Promise(function(resolve, reject) {
            axios.get(`${metadataEndpoint}?uri=${context}`)
                .then(({data}) => resolve(data))
                .catch(err => reject(err))
        })
    })
}


module.exports = function AclMetadataMiddlewareFactory() {
    const collectionConfig = JSON.parse(envyConf('ANNO').COLLECTION_DATA)

    function AclMetadataMiddleware(req, resp, next) {
        const {collection} = req.annoOptions = req.annoOptions || {}
        if (!collection) {
            console.log(errors.badRequest("Missing 'collection' in the request context"))
            return next()
        }
        const metadataToken = req.header('x-anno-metadata')
        const context = req.header('x-anno-context')
        const {metadataEndpoint} = collectionConfig[collection]

        if (metadataToken) {
            const {secret} = collectionConfig[collection]
            if (!secret) {
                console.log(errors.badRequest(`No 'secret' for collection: ${collection}`))
                return next()
            }
            jwt.verify(metadataToken, secret, (err, decoded) => {
                if (err) {
                    return next(errors.badRequest(`JWT choked on this X-Anno-Metadata token: ${err}`))
                }
                req.annoOptions.metadata = decoded
                return next()
            })
        } else if (!metadataEndpoint) {
            console.log(errors.badRequest(`Missing 'metadataEndpoint' in the configuration of collection '${collection}'`))
            return next()
        } else if (!context) {
            console.log(errors.badRequest(`No X-Anno-Context was passed, nothing to do :(`))
            return next()
        } else {
            cached(metadataEndpoint, collection, context)
                .then(data => {
                    req.annoOptions.metadata = data
                    console.log("AclMetadataMiddleware finished", data)
                    next()
                })
                .catch(err => {
                    console.log(err)
                    next()
                })
        }
    }
    AclMetadataMiddleware.unless = require('express-unless')
    return AclMetadataMiddleware
}

