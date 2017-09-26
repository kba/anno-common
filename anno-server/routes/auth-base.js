const jsonwebtoken = require('jsonwebtoken')
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

module.exports =
class AuthBase {

  constructor(router=require('express').Router()) {
    this.router = router
    ;['postLogin', 'postLogout', 'determineUser'].map(fn => {
      if (typeof this[fn] !== 'function')
        throw new Error(`Invalid auth subclass ${this.constructor.name}: Must implement '${fn}'`)
    })
  }

  build() {

    const {
      TOKEN_EXPIRATION,
      SMTP_HOST,
      SMTP_PORT,
      SMTP_TO,
      SMTP_FROM,
      SMTP_SECURE
    } = envyConf('ANNO', {
      TOKEN_EXPIRATION: 12 * 60 * 60,
      SMTP_SECURE: true,
    })

    const smtp = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE, // secure:true for port 465, secure:false for port 587
    })

    // XXX
    // XXX giant hack for the sake of debugging.
    // XXX
    this.router.get('/test', (req, resp) => resp.send(req.headers))

    //
    // POST /auth/login
    //
    this.router.post('/login', (...args) => this.postLogin(...args))
    this.router.get('/login', (...args) => this.getLogin(...args))

    //
    // GET /auth/logout
    //
    this.router.post('/logout', (...args) => this.postLogout(...args))
    this.router.get('/logout', (...args) => this.getLogout(...args))

    //
    // GET /register
    //
    this.router.get('/register', (req, resp) => {
        const sub = this.determineUser(req.headers)
        if (!sub) {
            return resp.status(401).send("You are not logged in, please do")
        } else {
            const {collectionsAvailable} = req.annoOptions
            resp.status(200)
            resp.render('register', {sub, collectionsAvailable})
        }
    })

    //
    // POST /register
    //
    this.router.post('/register', bodyParser.urlencoded('extended'), (req, resp) => {
        const sub = this.determineUser(req)
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
    // GET /auth/token
    //
    this.router.get('/token/:iss', (req, resp, next) => {
      const sub = this.determineUser(req)
      if (!sub) {
        resp.status(401)
        resp.header('Location', `login${req.query.from ? `?from=${req.query.from}` : ''}`)
        return resp.send('Please login')
      }

      const collectionConfig = req.annoOptions.collectionConfigFor(req.params.iss)
      const iss = req.params.iss
      if (!('secret' in collectionConfig)) {
        resp.status(500)
        return next(`No secret configured for issuer '${iss}'`)
      }

      const {secret} = collectionConfig
      const now = Math.floor(Date.now() / 1000)
      const exp = now + (collectionConfig.tokenExpiration || TOKEN_EXPIRATION)

      const token = jsonwebtoken.sign({iss, sub, exp}, secret)
      if (req.xhr) resp.header('X-Token', token)
      resp.send(token)

    })

    return this.router
  }
}

