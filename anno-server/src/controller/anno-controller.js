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

function errorHandler(err, req, resp, next) {
    if (err && err.code) {
        resp.status(err.code)
        resp.send(err.message) } else if (err) next(err)
    else next()
}

module.exports = ({store, guard, config}) => {

    function getAnnotation(req, resp, next) {
        store.get(req.params.annoId, (err, doc) => {
            if (err) return next(err)
            resp.header('Location', doc.id)
            resp.header('Link', '<http://www.w3.org/ns/ldp#Resource>; rel="type"')
            resp.header('Vary', 'Accept')
            resp.header('Content-Type', 'application/ld+json')
            return resp.send(doc)
        })
    }

    // TODO
    function searchAnnotations(req, resp, next) {
        var colUrl = config.BASE_URL + '/anno/'
        const qs = querystring.stringify(req.query)
        if (qs) colUrl += '?' + qs
        const options = {}
        ;['skipVersions', 'metadataOnly'].forEach(option => {
            if (req.query[option]) {
                options[option] = req.query[option]
                delete req.query[option]
            }
        })
        store.search(req.query, options, (err, docs) => {
            if (err) return next(err)
            resp.header('Content-Location', colUrl)
            resp.header('Vary', 'Accept, Prefer')
            resp.header('Link',
                '<http://www.w3.org/TR/annotation-protocol/>; rel="http://www.w3.org/ns/ldp#constrainedBy"')
            resp.header('Link',
                '<http://www.w3.org/TR/annotation-protocol/>; rel="http://www.w3.org/ns/ldp#constrainedBy"')
            resp.header('Content-Type', 'application/ld+json')

            resp.header('Link', '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"')
            const col = {
                type: ['BasicContainer', 'AnnotationCollection'],
                id: colUrl,
                total: docs.length,
            }
            if (col.total > 0) {
                Object.assign(col, {
                    first: {
                        id: colUrl,
                        startIndex: 0,
                        items: docs,
                    },
                    last: { id: colUrl },
                })
            }
            resp.send(col)
        })
    }


    const router = Router()

    //----------------------------------------------------------------
    // Web Annotation Protocol
    //----------------------------------------------------------------

    // 'Allow' header
    router.use((req, resp, next) => {
        resp.header('Allow', 'GET, HEAD, OPTIONS, DELETE, PUT')
        next()
    })

    //
    // HEAD /anno
    //
    // NOTE: HEAD must be defined before GET because express
    //
    router.head('/', (req, resp, next) => {
        req.query.metadataOnly = true
        next()
    }, searchAnnotations)

    //
    // GET /anno
    //
    router.get('/', searchAnnotations)

    //
    // POST /anno
    //
    router.post('/', (req, resp, next) => {
        const anno = prune(req.body)
        store.create(anno, (err, anno) => {
            if (err) return next(err)
            resp.status(201)
            req.params.annoId = anno.id
            return getAnnotation(req, resp, next)
        })
    })

    //
    // HEAD /anno/{annoId}
    //
    router.head('/:annoId', (req, resp, next) => {
        req.query.metadataOnly = true
        next()
    }, getAnnotation)

    //
    // GET /anno/{annoId}
    //
    router.get('/:annoId', getAnnotation)

    //
    // PUT /anno/{annoId}
    //
    router.put('/:annoId', (req, resp, next) => {
        store.revise(req.params.annoId, req.body, (err, doc) => {
            if (err) return next(err)
            resp.status(201)
            req.params.annoId = doc.id
            return getAnnotation(req, resp, next)
        })
    })

    //
    // DELETE /anno/{annoId}
    //
    router.delete('/:annoId', (req, resp, next) => {
        store.delete(req.params.annoId, (err, doc) => {
            if (err) return next(err)
            resp.status(204)
            return resp.send(doc)
        })
    })

    //----------------------------------------------------------------
    // Extensions
    //----------------------------------------------------------------

    //
    // POST /anno/{annoId}/reply
    //
    router.post(':annoId/reply', (req, resp, next) => {
        store.reply(req.params.annoId, req.body, (err, doc) => {
            if (err) return next(err)
            return resp.send(doc)
        })
    })

    //
    // DELETE /anno
    //
    router.delete('/', (req, resp, next) => {
        store.wipe((err) => {
            if (err) return next(err)
            resp.end()
        })
    })



    // Error Handler
    router.use(errorHandler)

    return router
}
