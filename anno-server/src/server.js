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

function loadFixtures(store, cb) {
    const annos = []
    const {ok} = require('@kba/anno-fixtures').Annotation
    for (let k in ok) annos.push(ok[k])
    store.create(annos, cb)
}

function errorHandler(err, req, res, next) {
    if (err.code !== undefined && err.code >= 400) {
        res.status(err.status)
        return res.send({error: err})
    } else if (Array.isArray(err)) {
        return res.send({error: err})
    }
    return next(err, req, res)
}

function start(app, cb) {
    const store = require('@kba/anno-store').load(module)
    const permDB = new nedb({filename: `./perm.nedb`})

    const cors       = require('./middleware/cors-middleware')()
    const jsonParser = require('./middleware/json-parser-middleware')()
    const jwtGuard   = require('./middleware/jsonwebtoken-middleware')(permDB, config)

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
                return loadFixtures(store, cb)
            })
        })
    })
}

const app = express()
app.use(morgan())
start(app, (err) => {
    if (err) throw err
    app.use(errorHandler)
    // Static files
    app.use(express.static(__dirname + '/../public'))
    app.listen(config.PORT,() => {
        console.log("Listening on port 3000")
    })
})

