const {Router} = require('express')
const yaml = require('js-yaml')
const fs = require('fs')

const swaggerDef = yaml.safeLoad(fs.readFileSync(__dirname + '/../../swagger-schema.yml'))

module.exports = ({db, config}) => {

    const router = Router()

    router.get('/', (req, resp) => {
        var ret = ''
        if (req.header('Accept').match('text/yaml')) {
            resp.status(200)
            resp.header('Content-Type', 'text/yaml')
            ret = yaml.safeDump(swaggerDef, null, 2)
        } else {
            resp.status(200)
            resp.header('Content-Type', 'application/json')
            ret = JSON.stringify(swaggerDef, null, 2)
        }
        return resp.send(ret)
    })

    return router
}
