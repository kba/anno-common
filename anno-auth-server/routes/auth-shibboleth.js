const AuthBase = require('./auth-base')

/**
 * Apache config:

 * <LocationMatch /anno/auth/*>
 *  AuthType shibboleth
 *  Require shibboleth
 *  ShibRequestSetting requireSession 0
 *  ShibUseHeaders On
 * </LocationMatch>
 *
 * <Location /anno/auth/login>
 *  AuthType shibboleth
 *  ShibRequestSetting requireSession 1
 *  Require valid-user
 *  ShibUseHeaders On
 * </Location>
 *
 */

module.exports = class AuthShibboleth extends AuthBase {

  constructor(...args) {
    super(...args)
  }

    // NOTE must be protected externally!
    getLogin(req, resp, next) {this.postLogin(req, resp, next)}

    postLogin(req, resp, next) {
      const sub = this.determineUser(req)
      const {from} = req
      if (sub) {
        if (!from) {
          resp.status(501)
          next('Logged in but cannot determine where to redirect')
        } else {
          resp.status(200)
          resp.redirect(from)
        }
      } else {
        resp.status(402)
        next('Not logged in')
      }
    }

    getLogout(req, resp, next) {return resp.send("Logout not implemented")}

    postLogout(req, resp, next) {return resp.send("Logout not implemented")}

    determineUser(req) {return req.headers.remote_user}

}
