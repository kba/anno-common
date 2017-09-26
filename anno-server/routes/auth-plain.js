const AuthBase = require('./auth-base')
const passport = require('passport')

function noSuchUser(username) {
  const ret = new Error(`No such user: ${username}`)
  ret.code = 404
  return ret
}

module.exports = class AuthPlain extends AuthBase {

  constructor(...args) {
    super(...args)

    const LocalStrategy = require('passport-local').Strategy

    passport.use(new LocalStrategy(function(username, password, done) {
      console.log(arguments)
      // TODO this is a giant hack of course
      if (username === 'john') return done(null, {id: username})
      return password === 'anno'
        ? done(null, {id: username})
        : done(null, false, noSuchUser(username))
    }))

    passport.serializeUser((user, cb) => cb(null, JSON.stringify(user)))
    passport.deserializeUser((userJSON, cb) => cb(null, JSON.parse(userJSON)) )

    this.router.use(require('connect-flash')())
    this.router.use(passport.initialize())
    this.router.use(passport.session())
  }

  determineUser(req) {return req.user}

  postLogin(req, resp, next) {
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

  getLogin(req, resp) {
    const {query, user} = req
    const error = req.flash('error')
    resp.render('plain-login', {query, user, error})
  }

  getLogout(req, resp) {
    const {query, user} = req
    const error = req.flash('error')
    resp.render('plain-logout', {query, user, error})
  }


}
