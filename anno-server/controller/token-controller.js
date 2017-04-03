const jsonwebtoken = require('jsonwebtoken')
const {Router} = require('express')
const {loadConfig} = require('@kba/anno-config')

module.exports = ({config}) => {

    const router = Router()
    const secret = loadConfig({
        JWT_SECRET: 'S3cr3t!',
    }).JWT_SECRET

    router.get('/', (req, resp) => {
        const token = jsonwebtoken.sign(req.query, secret)
        resp.send(token)
    })

    return router
}
