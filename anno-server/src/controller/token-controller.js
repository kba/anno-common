const jsonwebtoken = require('jsonwebtoken')
const {Router} = require('express')

module.exports = ({db, config}) => {

    const router = Router()

    router.get('/', (req, resp) => {
        const token = jsonwebtoken.sign(req.query, config.JWT_SECRET)
        resp.send(token)
    })

    return router
}
