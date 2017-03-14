const express = require('express')
const async = require('async')
const nedb = require('nedb')

const config = require('@kba/anno-config').loadConfig({
    JWT_SECRET: 'S3cr3t!',
    BASE_URL: 'http://localhost:3000',
})
const jsonMiddleware         = require('./middleware/json-parser-middleware')
const jsonwebtokenMiddleware = require('./middleware/jsonwebtoken-middleware')
const NedbStore              = require('./store/nedb-store')

const fixtures = require('./fixtures')

function start(app, cb) {
    const db = {
        anno: new nedb({filename: `/anno.nedb`}),
        perm: new nedb({filename: `/perm.nedb`}),
    }
    const guard = jsonwebtokenMiddleware(db, config)
    const routes = [
        'anno',
        'token',
        'swagger',
    ]
    async.eachOf(db, (coll, collName, doneColl) => {
        coll.loadDatabase(doneColl)
    }, (err) => {
        const Anno = new NedbStore({db, config})
        async.each(routes, (routerPath, done) => {
            const routerFn = require(`./controller/${routerPath}-controller`)
            app.use(`${routerPath}`, jsonMiddleware, routerFn({db, guard, config}))
            done()
        }, (err) => {
            db.anno.insert(fixtures.internal.anno, cb)
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
start(app, (err) => {
    app.use(errorHandler)
    // Static files
    app.use(express.static(__dirname + '/../public'))
    app.listen(3000,() => {
        console.log("Listening on port 3000")
    })
})

