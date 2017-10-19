const express = require('express')
const async = require('async')
const {envyConf} = require('envyconf')
const fs = require('fs')
const errorHandler = require('./middleware/error-handler')()
const bodyParser = require('body-parser')
const morgan = require('morgan')

envyConf('ANNO', {
    PORT: "3000",
    BASE_URL: 'http://localhost:3000',
    BASE_PATH: '',
    STORE: '@kba/anno-store-file',
    DIST_DIR: __dirname + '/public',
    ENABLE_JWT_AUTH: 'true',
})

function start(app, cb) {

    const ENABLE_JWT_AUTH = envyConf('ANNO')

    app.set('trust proxy', 'loopback')

    // Static files
    app.use('/dist', express.static(envyConf('ANNO').DIST_DIR))

    app.use(morgan('short'))

    app.use(bodyParser.json({type: '*/*', limit: 1 * 1024 * 1024}))

    const store = require('@kba/anno-store').load({
        loadingModule: module,
        loadPlugins: require('@kba/anno-util-loaders').loadPlugins,
    })

    const middlewares = [
        'anno-options',
        'user-auth',
        'acl-metadata',
        'cors',
    ]

    async.map(middlewares, (middleware, doneMiddleware) => {
        console.log(`Loading middleware ${middleware}`)
        require(`./middleware/${middleware}`)(doneMiddleware)
    }, (err, [
        annoOptions,
        userAuth,
        aclMetadata,
        cors,
    ]) => {
        if (err)
            return cb(err)
        app.use(cors)
        store.init(err => {
            if (err) return cb(err)

            const annoMiddlewares = []
            annoMiddlewares.push(annoOptions.unless({method:'OPTIONS'}))
            if (ENABLE_JWT_AUTH) annoMiddlewares.push(userAuth.unless({method:'OPTIONS'}))
            annoMiddlewares.push(aclMetadata.unless({method:'OPTIONS'}))

            app.use('/anno', ...annoMiddlewares, require('./routes/anno')({store}))

            app.use('/swagger', require('./routes/swagger')())

            app.get('/favicon.ico', (req, resp, next) => {
                fs.readFile(`${__dirname}/public/favicon.ico`, (err, ico) => {
                    if (err) return next(err)
                    resp.header('Content-Type', 'image/x-icon')
                    return resp.send(ico)
                })
            })

            // Fallback for GET: Redirect /:id to /anno/:id for pretty short URL
            app.get('/:id', (req, resp, next) => {
                resp.header('Location', `anno/${req.params.id}`)
                resp.status(302)
                resp.end()
            })

            app.use(errorHandler)
            return cb()
        })
    })
}

const app = express()
start(app, (err) => {
    // console.log("Config", JSON.stringify(envyConf('ANNO'), null, 2))
    if (err) throw err
    app.listen(envyConf('ANNO').PORT, () => {
        console.log("Config", JSON.stringify(envyConf('ANNO'), null, 2))
        console.log(`Listening on port ${envyConf('ANNO').PORT}`)
    })
})

