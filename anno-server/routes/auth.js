const jsonwebtoken = require('jsonwebtoken')
const {Router} = require('express')
const {loadConfig} = require('@kba/anno-config')
const passport = require('passport');

function noSuchUser(username) {
    const ret = new Error(`No such user: ${username}`)
    ret.code = 404
    return ret
}

module.exports = () => {

    const {SERVER_JWT_SECRET} = loadConfig({
        SERVER_JWT_SECRET: 'S3cr3t!'
    })

    const LocalStrategy = require('passport-local').Strategy;

    passport.use(new LocalStrategy(function(username, password, done) {
        // console.log(arguments)
        // TODO this is a giant hack of course
        if (username === 'john') return done(null, {id: username})
        return password === 'anno'
            ? done(null, {id: username})
            : done(null, false, noSuchUser(username));
    }));

    passport.serializeUser(function(user, cb) {
        cb(null, JSON.stringify(user))
    })

    passport.deserializeUser(function(userJSON, cb) {
        cb(null,JSON.parse(userJSON))
    })


    const router = Router()

    router.use(require('express-flash')())
    router.use(passport.initialize());
    router.use(passport.session());

    //
    // POST /auth/login
    //
    router.post('/login', (req, resp, next) => {
        console.log(req.query)
        passport.authenticate('local', {
            successRedirect: req.query.from || 'user',
            failureFlash: true
        })(req, resp, next)
    })

    //
    // GET /auth/logout
    //
    router.get('/logout', (req, resp) => {
        const {query, user} = req
        const error = req.flash('error')
        req.logout()
        resp.redirect(req.query.from || 'login')
    })

    //
    // GET /auth/login
    //
    router.get('/login', (req, resp) => {
        const {query, user} = req
        const error = req.flash('error')
        resp.render('login', {query, user, error})
    })

    //
    // GET /auth/token
    //
    router.get('/token', (req, resp) => {
        const from = req.query.from
        if (!req.user)
            return resp.redirect(req.query.from
                ? `login?from=${req.query.from}`
                : `login`)
        const token = jsonwebtoken.sign(req.user, SERVER_JWT_SECRET)
        if (req.xhr) resp.header('X-Token', token)
        resp.send(token)
    })

    return router
}
