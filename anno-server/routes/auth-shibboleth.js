const jsonwebtoken = require('jsonwebtoken')
const {Router} = require('express')
const {envyConf} = require('envyconf')
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')

function mailNewUser(user, displayName, collections) {
    return `
Dear Admin,

${user} wants to annotate in collection(s) ${collections.join(', ')}.
If she/he should, please add a new entry to users.yml:

'${user}':
  public:
      displayName: "${displayName}"
  rules:
${collections.map(c => `    - [{collection: '${c}'}, {role: 'creator'}] # or 'moderator'`).join('\n')}

Best,
Your Friendly Anno-Mailer`
}

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
 * <Location /anno/auth/register>
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
    const {SMTP_HOST, SMTP_PORT, SMTP_TO, SMTP_FROM} = envyConf('ANNO')
    const smtp = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: false, // secure:true for port 465, secure:false for port 587
    });


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
    // GET /register
    //
    router.get('/register', (req, resp) => {
        const sub = determineUser(req.headers)
        if (!sub) {
            return resp.status(401).send("You are not logged in, please do")
        } else {
            const {collectionsAvailable} = req.annoOptions
            resp.status(200)
            resp.render('register', {sub, collectionsAvailable})
        }
    })

    router.post('/register', bodyParser.urlencoded('extended'), (req, resp) => {
        const sub = determineUser(req.headers)
        const collections = Object.keys(req.body).filter(c => c.match(/^c_/)).map(c => c.substr(2))
        const {displayName} = req.body || 'Nicht angegeben'
        smtp.sendMail({
            from: SMTP_FROM,
            to: SMTP_TO,
            subject: `Anno-Registrierung ${sub}`, // Subject line
            text: mailNewUser(sub, displayName, collections)
        })
        resp.status(200)
        resp.send("Thank you, we'll review your application")
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
        const collectionConfig = req.annoOptions.collectionConfigFor(req.params.iss)

        const sub = determineUser(req.headers)
        if (!sub) {
            resp.status(401)
            return resp.send('Could not detect user identity from session')
        }

        const iss = req.params.iss
        if (!('secret' in collectionConfig)) {
            resp.status(500)
            return next(`No secret configured for issuer '${iss}'`)
        }
        const {secret} = collectionConfig
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
