const express = require('express')
const async = require('async')
const nedb = require('nedb')
const morgan = require('morgan')
const fs = require('fs')

const config = require('@kba/anno-config').loadConfig({
    JWT_SECRET: 'S3cr3t!',
    PORT: "3000",
    BASE_URL: 'http://localhost:3000',
})
const errorHandler = require('./middleware/error-handler')({config})

function start(app, cb) {
    const store = require('@kba/anno-store').load(module)
    const permDB = new nedb({filename: `./perm.nedb`})

    const cors       = require('./middleware/cors')({config})
    const jsonParser = require('./middleware/json-parser')({config})
    const jwtGuard   = require('./middleware/jsonwebtoken')(permDB, config)

    const routes = [ 'anno', 'swagger', 'token' ]
    store.init(err => {
        if (err) return cb(err)
        permDB.loadDatabase(err => {
            if (err) return cb(err)
            async.each(routes, (routerPath, done) => {
                const routerFn = require(`./controller/${routerPath}-controller`)
                console.log(`Binding localhost:${config.PORT}/${routerPath}`)
                app.use(`/${routerPath}`,
                    cors,
                    jsonParser,
                    routerFn({store, jwtGuard, config}))
                done()
            }, (err) => {
                if (err) return cb(err)
                return cb()
            })
        })
    })
}

const app = express()
app.use(morgan())
start(app, (err) => {
    if (err) throw err
    // Static files
    app.use(express.static(`${__dirname}/public`))
    app.use(errorHandler)
    app.listen(config.PORT,() => {
        console.log("Listening on port 3000")
    })
})

