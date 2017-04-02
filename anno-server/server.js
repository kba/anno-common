const express = require('express')
const async = require('async')
const nedb = require('nedb')
const morgan = require('morgan')
const {loadConfig} = require('@kba/anno-config')

loadConfig({
    JWT_SECRET: 'S3cr3t!',
    PORT: "3000",
    BASE_URL: 'http://localhost:3000',
})
const errorHandler = require('./middleware/error-handler')()

function start(app, cb) {
    const store = require('@kba/anno-store').load(module)
    const permDB = new nedb({filename: `./perm.nedb`})

    const cors       = require('./middleware/cors')()
    const jsonParser = require('./middleware/json-parser')()
    // const jwtGuard   = require('./middleware/jsonwebtoken')(permDB, config)

    const routes = [ 'anno', 'swagger', 'token' ]
    store.init(err => {
        if (err) return cb(err)
        permDB.loadDatabase(err => {
            if (err) return cb(err)
            async.each(routes, (routerPath, done) => {
                const routerFn = require(`./controller/${routerPath}-controller`)
                console.log(`Binding localhost:${loadConfig().PORT}/${routerPath}`)
                app.use(`/${routerPath}`,
                    cors,
                    jsonParser,
                    routerFn({store}))
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
    app.listen(loadConfig().PORT, () => {
        console.log("Config", JSON.stringify(loadConfig(), null, 2))
        console.log(`Listening on port ${loadConfig().PORT}`)
    })
})

