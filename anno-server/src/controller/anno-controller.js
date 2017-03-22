const {Router} = require('express')

module.exports = ({store, guard, config}) => {

    const router = Router()

    router.delete('/', (req, resp, next) => { 
        store.wipe((err) => {
            if (err) return next(err)
            resp.end()
        })
    })

    router.get('/', (req, resp, next) => { 
        store.search(req.query, (err, docs) => {
            if (err) return next(err)
            resp.send(docs)
        })
    })

    router.post('/', (req, resp, next) => { 
        store.create(req.body, (err, anno) => {
            if (err) return next(err)
            return resp.send(anno)
        })
    })

    router.put('/:annoId', (req, resp, next) => { 
        store.revise(req.params.annoId, req.body, (err, doc) => {
            if (err && err.code) {
                resp.status(err.code)
                return resp.send(err.message)
            } else if(err)
                return next(err)
            return resp.send(doc)
        })
    })

    router.get('/:annoId', (req, resp, next) => { 
        store.get(req.params.annoId, (err, doc) => {
            if (err && err.code) {
                resp.status(err.code)
                return resp.send(err.message)
            } else if(err)
                return next(err)
            return resp.send(doc)
        })
    })

    router.delete('/:annoId', (req, resp, next) => { 
        store.delete(req.params.annoId, (err, doc) => {
            if (err && err.code) {
                resp.status(err.code)
                return resp.send(err.message)
            } else if(err)
                return next(err)
            return resp.send(doc)
        })
    })

    router.head('/:annoId', (req, resp, next) => { 
        const options = {
            metadataOnly: true
        }
        store.get(req.params.annoId, options, (err, doc) => {
            if (err) return next(err)
            return resp.send(doc)
        })
    })

    // // XXX TODO
    // router.get('/:annoId/**', (req, resp, next) => { 
    //     var chain = req.path.split('/')
    //     const annoId = chain[1]
    //     store.get(req.params.annoId, chain.slice(2), (err, doc) => {
    //         if (err) return next(err)
    //         return resp.send(doc)
    //     })
    // })

    return router
}
