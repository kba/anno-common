const AuthBase = require('./auth-base')
const passport = require('passport')
const bodyParser   = require('body-parser')

module.exports = class AuthPlain extends AuthBase {

  constructor(...args) {
    super(...args)

    const LocalStrategy = require('passport-local').Strategy

    passport.use(new LocalStrategy(function(username, password, done) {
      // // TODO this is a giant hack of course
      // if (username === 'john') return done(null, {id: username})
      // return password === 'anno'
      //   ? done(null, {id: username})
      //   : done(null, false, noSuchUser(username))
      // XXX TODO WARNING this is a wide open stupid security no-no!
      return done(null, {id: username})
    }))

    passport.serializeUser((user, cb) => cb(null, JSON.stringify(user)))
    passport.deserializeUser((userJSON, cb) => cb(null, JSON.parse(userJSON)) )

    this.router.use(passport.initialize())
    this.router.use(passport.session())
    this.router.use(bodyParser.urlencoded({extended: true}))
  }

  determineUser(req) {return req.user ? req.user.id : ''}

  getLogin(req, resp) {
    const error = req.flash('error')
    const {from, collectionsAvailable} = req
    if (req.user) {
      resp.redirect(`logout?from=${from}`)
    } else {
      resp.render('plain-login', {
        sub: false,
        debugAuth: req.debugAuth,
        collectionsAvailable,
        error
      })
    }
  }

  getLogout(req, resp) {
    const {from} = req.query
    const error = req.flash('error')
    const {collectionsAvailable} = req
    const sub = this.determineUser(req)
    if (!req.user) {
      resp.redirect(`login?from=${from}`)
    } else {
      resp.render('plain-logout', {
        from: 'logout',
        sub,
        debugAuth: req.debugAuth,
        collectionsAvailable,
        error
      })
    }
  }

  postLogin(req, resp, next) {
    console.log(req.query)
    passport.authenticate('local', {
      successRedirect: req.query.from || 'logout',
      failureRedirect: 'login',
      failureFlash: true,
    })(req, resp, (err, req, resp) => {
      if (err) {
        console.log(err)
        return next(err)
      }
    })
  }

  postLogout(req, resp) {
    req.flash('error')
    req.logout()
    resp.redirect(req.query.from || 'login')
  }

}
