const express = require('express')
const async = require('async')
const {loadConfig} = require('@kba/anno-config')
process.env.ANNO_LOGLEVEL = 'silly'

loadConfig({
    PORT: "3000",
    BASE_URL: 'http://localhost:3000',
    BASE_PATH: '',
    SERVER_SESSION_KEY: '9rzF3nWDAhmPS3snhh3nwe4RCDNebaIkg7Iw3aJY9JLbiXxnVahcTCckuls6qlaK'
})
function start(app, cb) {
    app.use(require('morgan')('dev'))
    app.set('views', `${__dirname}/views`)
    app.set('view engine', 'pug')

    app.use(require('body-parser').urlencoded({ extended: true }));
    app.use(require('body-parser').json({type: '*/*'}))

    app.use(require('cookie-parser')());
    app.use(require('express-session')({
        secret: loadConfig().SERVER_SESSION_KEY,
        resave: false,
        saveUninitialized: false
    }))
    app.use(require('./middleware/cors')())

    const store = require('@kba/anno-store').load(module)

    const routes = [ 'anno', 'swagger', 'token' ]
    store.init(err => {
        if (err) return cb(err)
        app.use('/anno',
            require('./middleware/jsonwebtoken')(),
            require('./middleware/anno-options')(),
            require('./routes/anno')({store}))
        app.use('/swagger',
            require('./routes/swagger')())
        app.use('/auth',
            require('./routes/auth')({store}))

        // Static files
        app.use(express.static(`${__dirname}/public`))

        // Error handler
        app.use(require('./middleware/error-handler')())
        return cb()
    })
}

const app = express()
start(app, (err) => {
    if (err) throw err
    app.listen(loadConfig().PORT, () => {
        console.log("Config", JSON.stringify(loadConfig(), null, 2))
        console.log(`Listening on port ${loadConfig().PORT}`)
    })
})

