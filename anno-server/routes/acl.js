const {Router} = require('express')
const async = require('async')

module.exports = ({store}) => {

    const router = Router()

    router.post('/', (req, resp, next) => {
        const urls = req.body
        const ret = {}
        async.forEach(urls, (url, urlDone) => {
            ret[url] = {}
            const anno = {target: url}
            store.get(url, {dryRun: true}, (err, ctx) => {
                ret[url].read = !err
                store.create(anno, {dryRun: true}, (err, ctx) => {
                    ret[url].create = !err
                    store.revise(url, anno, {dryRun: true}, (err, ctx) => {
                        ret[url].revise = !err
                        store.delete(url, {dryRun: true}, (err, ctx) => {
                            ret[url].delete = !err
                            urlDone()
                        })
                    })
                })
            })
        }, (err) => {
            if (err) return next(err)
            resp.send(ret)
        })
    })

    return router
}

