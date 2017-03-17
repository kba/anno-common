const {Router} = require('express')

module.exports = ({store, guard, config}) => {

    const router = Router()

    router.get('/', (req, resp) => { 
        store.search(req.query, (err, docs) => {
            resp.send(docs)
        })
    })

    router.post('/', (req, res, next) => { 
        store.create(req.body, (err, anno) => {
            if (err) return next(err)
            return res.send(anno)
        })
    })

    router.get('/:annoId', (req, resp, next) => { 
        store.get(req.params.annoId, (err, doc) => {
            if (err) return next(err)
            return resp.send(doc)
        })
    })

    // XXX TODO
    router.get('/:annoId/**', (req, resp, next) => { 
        var chain = req.path.split('/')
        const annoId = chain[1]
        store.get(req.params.annoId, chain.slice(2), (err, doc) => {
            if (err) return next(err)
            return resp.send(doc)
        })
    })

    return router
}
