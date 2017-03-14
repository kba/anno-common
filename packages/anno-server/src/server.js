const express = require('express')
const async = require('async')
const nedb = require('nedb')
const morgan = require('morgan')

const config = require('@kba/anno-config').loadConfig({
    JWT_SECRET: 'S3cr3t!',
    PORT: "3000",
    BASE_URL: 'http://localhost:3000',
})
const jsonMiddleware         = require('./middleware/json-parser-middleware')
const jsonwebtokenMiddleware = require('./middleware/jsonwebtoken-middleware')

const fixtures = require('./fixtures')

function start(app, cb) {
    const store = require('@kba/anno-store').load(module)
    // const db = {
    //     anno: new nedb({filename: `/anno.nedb`}),
    //     perm: new nedb({filename: `/perm.nedb`}),
    // }
    const permDB = new nedb({filename: `./perm.nedb`})
    const guard = jsonwebtokenMiddleware(permDB, config)
    const routes = [ 'anno', 'token', 'swagger', ]
    store.init(err => {
        if (err) return cb(err)
        permDB.loadDatabase(err => {
            if (err) return cb(err)
            async.each(routes, (routerPath, done) => {
                const routerFn = require(`./controller/${routerPath}-controller`)
                console.log(`Binding localhost:${config.PORT}/${routerPath}`)
                app.use(`/${routerPath}`, jsonMiddleware, routerFn({store, guard, config}))
                done()
            }, (err) => {
                if (err) return cb(err)
                store.create(fixtures.internal.anno, cb)
            })
        })
    })
}

const errorHandler = (err, req, res, next) => {
    if (err.status !== undefined && err.status >= 400) {
        res.status(err.status)
        return res.send({error: err})
    }
    return next(err, req, res)
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

