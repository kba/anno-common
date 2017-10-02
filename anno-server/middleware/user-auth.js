const errors = require('@kba/anno-errors')
const expressJWT = require('express-jwt')

module.exports = function UserAuthMiddlewareFactory(cb) {

    function UserAuthMiddleware(req, resp, next) {
      // console.log(req.annoOptions)
        const {collectionConfig, collection} = req.annoOptions = req.annoOptions || {}
        if (!collectionConfig) {
            console.log(errors.badRequest("userAuth: Missing 'collection' in the request context"))
            return next()
        }

        const {secret} = collectionConfig
        // Get Bearer token from Auth HTTP Header and verify with collection's secret
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
                // console.log(errors.badRequest(`No token present, cannot authenticate.`))
                return next()
            }

            if (!('iss' in authToken) || !('sub' in authToken)) {
                console.log("Obsolete token?", {authToken})
                return next(errors.badRequest(
                    `AuthToken must have 'sub' and 'iss' fields`, authToken))
            }
            if (collection !== authToken.iss) {
                return next(errors.mismatch(
                    "Inconsistent 'X-Anno-Collection' vs 'JWT.iss'", collection, authToken.iss))
            }
            req.annoOptions.user = authToken.sub

            console.log("JWT verified", authToken)
            next()
        })
    }
    UserAuthMiddleware.unless = require('express-unless')
    return cb(null, UserAuthMiddleware)
}
