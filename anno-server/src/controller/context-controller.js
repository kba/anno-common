const {Router} = require('express')
const yaml = require('js-yaml')

const {jsonldContext} = require('@kba/anno-schema')

const jsonldContextAsJSON = JSON.stringify(jsonldContext, null, 2)
function sendJSON(req, resp) {
    resp.status(200)
    resp.header('Content-Type', 'application/json')
    resp.send(jsonldContextAsJSON)
}

const jsonldContextAsYAML = yaml.safeDump(jsonldContext)
function sendYAML(req, resp) {
    resp.status(200)
    resp.header('Content-Type', 'text/yaml')
    resp.send(jsonldContextAsYAML)
}

module.exports = ({config}) => {

    const router = Router()

    router.get('/json', sendJSON)
    router.get('/yaml', sendYAML)
    router.get('/', (req, resp) => {
        return (req.header('Accept').match('text/yaml'))
            ? sendYAML(req, resp)
            : sendJSON(req, resp)
    })

    return router
}
