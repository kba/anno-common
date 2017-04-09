const {Router} = require('express')
const async = require('async')

module.exports = ({store}) => {

    const router = Router()

    router.post('/', (req, resp, next) => {
        const urls = req.body.targets
        store.aclCheck(urls, (err, perms) => {
            if (err) return next(err)
            return resp.send(perms)
        })
    })

    return router
}

