const express = require('express')
const async = require('async')
const morgan = require('morgan')
const {loadConfig} = require('@kba/anno-config')
process.env.ANNO_LOGLEVEL = 'silly'

loadConfig({
    PORT: "3000",
    BASE_URL: 'http://localhost:3000',
})
const errorHandler = require('./middleware/error-handler')()

function start(app, cb) {
    const store = require('@kba/anno-store').load(module)
    // store.use(require('@kba/anno-mw-user-static')())
    // store.use(require('@kba/anno-mw-acl-static')())

    const cors       = require('./middleware/cors')()
    const jsonParser = require('./middleware/json-parser')()
    const jsonwebtoken   = require('./middleware/jsonwebtoken')()

    const routes = [ 'anno', 'swagger', 'token' ]
    store.init(err => {
        if (err) return cb(err)
        app.use('/anno',
            cors,
            // jsonwebtoken,
            jsonParser,
            require('./controller/anno-controller')({store}))
        app.use('/swagger',
            cors,
            require('./controller/swagger-controller')())
        app.use('/token',
            cors,
            require('./controller/token-controller')({store}))
        return cb()
    })
}

const app = express()
app.use(morgan())
start(app, (err) => {
    if (err) throw err
    // Static files
    app.use(express.static(`${__dirname}/public`))
    app.use(errorHandler)
    app.listen(loadConfig().PORT, () => {
        console.log("Config", JSON.stringify(loadConfig(), null, 2))
        console.log(`Listening on port ${loadConfig().PORT}`)
    })
})

