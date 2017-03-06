const express = require('express')
const nedb = require('nedb')
const ajv = require('ajv')
const async = require('async')
const jsonMiddleware = require('body-parser').json({type: '*/*'})

const jwtMiddleware = require('./jwt-middleware')
const fixtures = require('./fixtures')

const config = {
    JWT_SECRET: 'S3cr3t!',
    // baseUri: 'http://ub.uni-hd.de/anno-service',
    baseUri: 'http://localhost:3000',
}


function start (app, cb) {
    const db = {
        anno: new nedb({filename: './anno.nedb'}),
        perm: new nedb({filename: './perm.nedb'}),
    }
    const guard = jwtMiddleware(db, config)
    const routes = {
        '/anno': require('./controller/anno-controller'),
        '/token': require('./controller/token-controller'),
        '/swagger': require('./controller/swagger-controller'),
    }
    async.eachOf(db, (coll, collName, doneColl) => {
        coll.loadDatabase(doneColl)
    }, (err) => {
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

