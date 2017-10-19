const express             = require('express')
const cookieParser        = require('cookie-parser')
const expressSession      = require('express-session')
const morgan              = require('morgan')

module.exports = function createAuthRoute({backend, sessionKey}) {
  const app = express.Router()
  app.use(morgan('dev'))
  app.use((req, resp, next) => {
    resp.header('Access-Control-Allow-Origin', req.get('Origin'))
    resp.header('Access-Control-Allow-Headers', 'Content-Type, Prefer, Authorization, X-Anno-Context, X-Anno-Collection, X-Anno-Metadata')
    resp.header('Access-Control-Allow-Credentials', 'true')
    resp.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, DELETE, PUT')
    resp.header('Access-Control-Expose-Headers', 'ETag, Allow, Vary, Link, Content-Type, Location, Content-Location, Prefer')
    return next()
  })
  app.use(cookieParser())
  app.use(expressSession({
    secret: sessionKey,
    resave: false,
    saveUninitialized: false
  }))
  const authRoute = new(require(`./auth-${backend}`))()
  app.use(authRoute.build())

  return app
}
