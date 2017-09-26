const jsonwebtoken = require('jsonwebtoken')
const AuthBase = require('./auth-base')

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

module.exports = class AuthShibboleth extends AuthBase {

    getLogin(req, resp, next) {
        console.log(req.headers)
        this.postLogin(req, resp, next)
    }

    getLogout(req, resp, next) {
        console.log('getLogout')
    }

    postLogout(req, resp, next) {
        console.log('postLogout')
    }

    postLogin(req, resp, next) {
      const sub = this.determineUser(req)
      if (sub) {
        const redirectTo = [
          req.query.from,
          '/'
        ].find(x => !! x)
        if (!redirectTo) {
          resp.status(501)
          next('Logged in but cannot determine where to redirect')
        } else {
          resp.status(200)
          resp.redirect(redirectTo)
        }
      } else {
        resp.status(402)
        next('Not logged in')
      }
    }

    determineUser(req) {
      const field = [
        'eppn',
        'persistent_id',
        'persistent-id',
        'remote-user',
      ].find(k => req.headers[k])
      if (field)
        return req.headers[field]
    }


}
