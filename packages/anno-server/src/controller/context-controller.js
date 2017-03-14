const {Router} = require('express')
const yaml = require('js-yaml')

const {jsonldContext} = require('@kba/anno-schema')

const jsonldContextAsJSON = JSON.stringify(jsonldContext, null, 2)
const jsonldContextAsYAML = yaml.safeDump(jsonldContext)

module.exports = ({config}) => {

    const router = Router()

    router.get('/jsonld', (req, resp) => {
        resp.status(200)
        resp.header('Content-Type', 'application/json')
        resp.send(jsonldContextAsJSON)
    })

    router.get('/yaml', (req, resp) => {
        resp.status(200)
        resp.header('Content-Type', 'text/yaml')
        resp.send(jsonldContextAsYAML)
    })

    router.get('/', (req, resp) => {
        var ret = ''
        if (req.header('Accept').match('text/yaml')) {
            resp.status(200)
            resp.header('Content-Type', 'text/yaml')
            ret = jsonldContextAsYAML
        } else {
            resp.status(200)
            resp.header('Content-Type', 'application/json')
            ret = jsonldContextAsJSON
        }
        return resp.send(ret)
    })

    return router
}
