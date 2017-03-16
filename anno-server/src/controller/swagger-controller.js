const {Router} = require('express')
const yaml = require('js-yaml')
const fs = require('fs')

const mustache = require('mustache')

module.exports = ({db, config}) => {

    const router = Router()

    const swaggerDef = yaml.safeLoad(mustache.render(
        fs.readFileSync(__dirname + '/../../swagger-schema.yml', {encoding: 'utf-8'}),
        {config}))
    swaggerDef.definitions = require('@kba/anno-schema').definitions

    const swaggerDefAsJSON = JSON.stringify(swaggerDef, null, 2)
    function sendJSON(resp) {
        resp.status(200)
        resp.header('Content-Type', 'application/json')
        resp.send(swaggerDefAsJSON)
    }

    const swaggerDefAsYAML = yaml.safeDump(swaggerDef, null, 2)
    function sendYAML(resp) {
        resp.status(200)
        resp.header('Content-Type', 'text/yaml')
        resp.send(swaggerDefAsYAML)
    }

    router.get('/', (req, resp) => {
        var ret = ''
        if (req.header('Accept').match('text/html')) {
            resp.status(302)
            resp.header('Location', `${config.BASE_URL}/swagger-ui/dist/index.html?url=/swagger`)
            resp.end()
        } else if (req.header('Accept').match('text/yaml')) {
            sendYAML(resp)
        } else {
            sendJSON(resp)
        }
    })

    router.get('/json', (req, resp) => { sendJSON(resp) })
    router.get('/yaml', (req, resp) => { sendYAML(resp) })

    return router
}
