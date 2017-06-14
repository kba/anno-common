const jsonwebtoken = require('jsonwebtoken')
const {Router} = require('express')
const {envyConf} = require('envyconf')

function determineUser(env) {
    const field = [
        'eppn',
        'persistent_id',
        'persistent-id',
        'remote-user',
    ].find(k => env[k])
    if (field)
        return env[field]
}

/**
 * Apache config:

 * <Location /anno/auth/token>
 *  AuthType shibboleth
 *  ShibRequestSetting requireSession 0
 *  Require Shibboleth
 *  ShibUseHeaders On
 * </Location>
 *
 * <Location /anno/auth/login>
 *  AuthType shibboleth
 *  ShibRequestSetting requireSession 1
 *  require valid-user
 *  ShibUseHeaders On
 * </Location>
 *
 */

module.exports = () => {

    const router = Router()
    const collectionConfig = JSON.parse(envyConf('ANNO').COLLECTION_DATA)

    //
    // GET /login
    //
    router.get('/login', (req, resp) => {
        const sub = determineUser(req.headers)
        if (sub)  {
            const redirectTo = [
                req.query.from,
                req.headers.referer,
                '/'
            ].find(x => !! x)
            console.log(`user '${sub}' logged in`, {redirectTo})
            return resp.redirect(redirectTo)
        } else {
            resp.status(401)
            resp.send("Failed to log in")
        }
    })

    //
    // GET /logout
    //
    router.get('/logout', (req, resp) => {
        const {query, user} = req
        const error = req.flash('error')
        req.logout()
        resp.redirect(req.query.from || 'login')
    })

    //
    // GET /token
    //
    router.get('/token/:iss', (req, resp, next) => {

        const sub = determineUser(req.headers)
        if (!sub) {
            resp.status(401)
            return resp.send('Could not detect user identity from session')
        }

        const iss = req.params.iss
        if (!(iss in collectionConfig)) {
            resp.status(404)
            return next(`No such issuer '${iss}'`)
        } else if (!('secret' in collectionConfig[iss])) {
            resp.status(500)
            return next(`No secret configured for issuer '${iss}'`)
        }
        const secret = collectionConfig[iss].secret
        const now = Math.floor(Date.now() / 1000)
        const exp = now + (collectionConfig.tokenExpiration || 12 * 60 * 60)

        const token = jsonwebtoken.sign({iss, sub, exp}, secret)
        if (req.xhr) resp.header('X-Token', token)
        resp.send(token)
    })

    //
    // GET /test
    //
    router.get('/test', (req, resp) => resp.send(req.headers))


    return router
}
