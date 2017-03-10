const express = require('express')
const ajv = require('ajv')
const async = require('async')
const nedb = require('nedb')

const config                 = require('./config')
const jsonMiddleware         = require('./middleware/json-parser-middleware')
const jsonwebtokenMiddleware = require('./middleware/jsonwebtoken-middleware')
const NedbStore              = require('./store/nedb-store')

const fixtures = require('./fixtures')

function start (app, cb) {
    const db = {
        anno: new nedb({filename: `/anno.nedb`}),
        perm: new nedb({filename: `/perm.nedb`}),
    }
    const guard = jsonwebtokenMiddleware(db, config)
    const routes = {
        '/anno': require('./controller/anno-controller'),
        '/token': require('./controller/token-controller'),
        '/swagger': require('./controller/swagger-controller'),
    }
    async.eachOf(db, (coll, collName, doneColl) => {
        coll.loadDatabase(doneColl)
    }, (err) => {
        const Anno = new NedbStore({db, config})
        async.eachOf(routes, (routerFn, routerPath, done) => {
            app.use(routerPath, jsonMiddleware, routerFn({db, guard, config}))
            done()
        }, (err) => {
            db.anno.insert(fixtures.internal.anno, cb)
        })
    })
}


const app = express()
start(app, (err) => {
    app.use((err, req, res, next) => {
        if (err.status !== undefined && err.status >= 400) {
            res.status(err.status)
            return res.send({error: err})
        }
        return next(err, req, res)
    })
    // Static files
    app.use(express.static(__dirname + '/../public'))
    app.listen(3000,() => {
        console.log("Listening on port 3000")
    })
})

