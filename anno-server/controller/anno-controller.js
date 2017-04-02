const querystring = require('querystring')
const {Router} = require('express')
const {prune} = require('@kba/anno-util')

function optionsFromRequest(req) {
    const ret = {}
    ;['skipVersions', 'metadataOnly'].forEach(option => {
        if (req.query[option]) {
            ret[option] = req.query[option]
            delete req.query[option]
        }
    })
    return ret
}

module.exports = ({store, guard, config}) => {

    const contentNegotiation = require('../middleware/content-negotiation')({config})
    const errorHandler = require('../middleware/error-handler')({config})

    function getAnnotation(req, resp, next) {
        const options = optionsFromRequest(req)
        store.get(req.params.annoId, options, (err, doc) => {
            if (err) return next(err)
            resp.header('Location', doc.id)
            resp.header('Link', '<http://www.w3.org/ns/ldp#Resource>; rel="type"')
            resp.header('Vary', 'Accept')
            resp.header('Content-Type', 'application/ld+json; profile="http://www.w3.org/ns/anno.jsonld"')
            resp.jsonld = doc
            return next()
        })
    }

    // TODO
    function getCollection(req, resp, next) {
        var colUrl = config.BASE_URL + '/anno/'
        const qs = querystring.stringify(req.query)
        if (qs) colUrl += '?' + qs
        const options = optionsFromRequest(req)
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
                '@context': 'http://www.w3.org/ns/anno.jsonld',
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
            resp.jsonld = col
            next()
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
    }, getCollection)

    //
    // GET /anno
    //
    router.get('/', getCollection)

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
        const anno = prune(req.body)
        store.revise(req.params.annoId, anno, (err, doc) => {
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

    //----------------------------------------------------------------
    // Content-Negotiation
    //----------------------------------------------------------------
    router.use(contentNegotiation)

    //----------------------------------------------------------------
    // Error Handler
    //----------------------------------------------------------------
    router.use(errorHandler)

    return router
}
