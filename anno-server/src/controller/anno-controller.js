const querystring = require('querystring')
const {Router} = require('express')

function pruneEmptyStrings(obj) {
    Object.keys(obj).forEach(k => {
        if (obj[k] === '') {
            delete obj[k]
        } else if (typeof obj === 'object' && !Array.isArray(obj)) {
            pruneEmptyStrings(obj[k])
        }
    })
    return obj
}

function pruneEmptyObjects(obj) {
    Object.keys(obj).forEach(k => {
        if (typeof obj === 'object' && !Array.isArray(obj))
            pruneEmptyObjects(obj[k])
        if (typeof obj[k] === 'object' && Object.keys(obj[k]).length === 0)
            delete obj[k]
    })
    return obj
}

function pruneEmptyArrays(obj) {
    Object.keys(obj).forEach(k => {
        if (Array.isArray(obj[k]) && obj[k].length === 0) {
            delete obj[k]
        } else if (typeof obj === 'object' && !Array.isArray(obj)) {
            pruneEmptyArrays(obj[k])
        }
    })
    return obj
}

function prune(obj) {
    obj = pruneEmptyStrings(obj)
    obj = pruneEmptyObjects(obj)
    obj = pruneEmptyArrays(obj)
    return obj
}

module.exports = ({store, guard, config}) => {

    const router = Router()

    router.head('/', (req, resp, next) => { 
        req.query.metadataOnly = true
        resp.redirect(`${req.originalUrl}?${querystring.stringify(req.query)}`)
    })

    router.get('/', (req, resp, next) => { 
        store.search(req.query, (err, docs) => {
            if (err) return next(err)
            resp.send(docs)
        })
    })

    router.post('/', (req, resp, next) => { 
        store.create(prune(req.body), (err, anno) => {
            if (err) return next(err)
            return resp.send(anno)
        })
    })

    router.delete('/', (req, resp, next) => { 
        store.wipe((err) => {
            if (err) return next(err)
            resp.end()
        })
    })

    router.head('/:annoId', (req, resp, next) => { 
        req.query.metadataOnly = true
        resp.redirect(`${req.originalUrl}?${querystring.stringify(req.query)}`)
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

    router.post(':annoId/reply', (req, resp, next) => {
        store.reply(req.params.annoId, req.body, (err, doc) => {
            if (err && err.code) {
                resp.status(err.code)
                return resp.send(err.message)
            } else if(err)
                return next(err)
            return resp.send(doc)
        })
    })

    return router
}
