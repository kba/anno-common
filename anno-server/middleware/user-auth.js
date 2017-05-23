const errors = require('@kba/anno-errors')
const expressJWT = require('express-jwt')
const {envyConf} = require('envyconf')

module.exports = function UserAuthMiddlewareFactory() {
    const collectionConfig = JSON.parse(envyConf('ANNO').COLLECTION_DATA)
    this.unless = require('express-unless')

    return function UserAuthMiddleware(req, resp, next) {
        const {collection} = req.annoOptions = req.annoOptions || {}
        if (!collection)
            return next(errors.badRequest("Missing 'collection' in the request context"))

        const {secret} = collectionConfig[collection]
        // Get Bearer token from Auth HTTP Header and verify with collection's secret
        if (!secret) {
            console.log(errors.badRequest(`No 'secret' for collection: ${collection}`))
            return next()
        }
        expressJWT({
            secret,
            requestProperty: 'authToken'
        })(req, resp, (err) => {
            if (err && err.code !== 'credentials_required') {
                // XXX Note we don't pass any errors on so ACL can be handled by
                // anno-store / anno-acl
                console.log("JWT Error", err)
            }
            const {authToken} = req
            if (!authToken) {
                console.log(errors.badRequest(`Failed to parse/verify JWT`))
                return next()
            }

            if (!('iss' in authToken) || !('sub' in authToken)) {
                return next(errors.badMetadat(`AuthToken must have 'sub' and 'iss' fields`, authToken))
            }
            if (collection !== authToken.iss) {
                return next(errors.mismatch("Inconsistent 'X-Anno-Collection' vs 'JWT.iss'", collection, authToken.iss))
            }
            req.annoOptions.user = authToken.sub

            console.log("JWT verified", authToken)
            next()
        })
    }
}
