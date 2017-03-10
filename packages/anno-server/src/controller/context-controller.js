const {Router} = require('express')
const yaml = require('js-yaml')
const config = require('../config')()

const context = [
    'http://www.w3.org/ns/anno.jsonld',
    {
        'AnnotationReply': {
        },
        'hasVersion': config.PROP_HAS_VERSION,
        'versionOf': config.PROP_VERSION_OF,
        'replyTo': config.PROP_REPLY_TO,
    }
]

const contextAsJSON = JSON.stringify(context, null, 2)
const contextAsYAML = yaml.safeDump(context)

module.exports = ({db}) => {

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
