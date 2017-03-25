const {Store} = require('@kba/anno-store')
const config = require('@kba/anno-config').loadConfig({
    COLLECTION: 'default'
})
const schema = require('@kba/anno-schema')
const async = require('async')

class MongolikeStore extends Store {

    constructor(...args) { super(...args) }

    /* @override */
    init(cb) { throw(new Error("Must override 'init'")) }

    /* @override */
    wipe(cb) { throw(new Error("Must override 'wipe'")) }

    /* @override */
    connect(cb) { return cb(); }

    /* @override */
    disconnect(cb) { return cb(); }

    /* @override */
    get(annoIds, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        const wasArray = Array.isArray(annoIds)
        if (!wasArray) annoIds = [annoIds]
        const projection = this._projectionFromOptions(options)
        async.map(annoIds, (annoId, done) => {
            annoId = this._idFromURL(annoId)
            var [_id, _revid] = annoId.split(/-rev-/)
            const query = {_id, deleted: {$exists: false}}
            this.db.findOne(query, projection, (err, doc) => {
                if (err) return done(err)
                if (!doc) return done(this._annotationNotFoundError(annoId))
                const rev = (_revid) 
                    ? doc._revisions[_revid -1]
                    : doc._revisions[doc._revisions.length - 1]
                if (!rev) return done(this._revisionNotFoundError(_id, _revid))
                if (options.latest) {
                    annoId = `${_id}-rev-${doc._revisions.length}`
                    doc = rev
                }
                return done(null, this._toJSONLD(annoId, doc, options))
            })
        }, (err, annos) => {
            if (err) return cb(err)
            if (wasArray) return cb(null, annos)
            return cb(null, annos[0])
        })
    }

    /* @override */
    create(annosToCreate, cb) {
        annosToCreate = JSON.parse(JSON.stringify(annosToCreate))
        var wasArray = Array.isArray(annosToCreate)
        if (!wasArray) {
            annosToCreate = [annosToCreate]
        }
        const errors = []
        annosToCreate = annosToCreate.map(anno => {
            anno = this._deleteId(anno)
            const validFn = schema.validate.Annotation
            if (!validFn(anno)) {
                return errors.push(this._invalidAnnotationError(anno, validFn.errors))
            }
            anno = this._normalizeTarget(anno)
            anno = this._normalizeType(anno)
            anno._revisions = [JSON.parse(JSON.stringify(anno))]
            const created = new Date()
            anno.modified = created
            anno.created = created
            anno._revisions[0].created = created
            anno._id = this._genid()
            return anno
        })
        if (errors.length > 0) return cb(this._invalidAnnotationError({errors}))
        this.db.insert(annosToCreate, (err, savedAnnos) => {
            // Mongodb returns an object describing the result, nedb returns just the results
            var {insertedIds} = savedAnnos
            if (!insertedIds) insertedIds = savedAnnos.map(savedAnno => savedAnno._id)
            if (err) return cb(err)
            if (!wasArray) return this.get(insertedIds[0], cb)
            return this.get(insertedIds, cb)
        })
    }

    // https://www.w3.org/TR/annotation-protocol/#update-an-existing-annotation
    /* @override */
    revise(annoId, anno, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        annoId = this._idFromURL(annoId)
        var [_id, _revid] = annoId.split(/-rev-/)
        this.db.findOne({_id}, (err, existingAnno) => {
            if (err) return cb(err)
            if (!existingAnno) return cb(this._annotationNotFoundError(_id))
            ;['canonical', 'via', 'hasVersion', 'versionOf'].forEach(prop => {
                if (anno[prop] && anno[prop] !== existingAnno[prop]) {
                    return cb(this._readonlyValueError(annoId, 'canonical'))
                }
            })
            // if (anno
            anno = this._deleteId(anno)
            const validFn = schema.validate.Annotation
            if (!validFn(anno)) {
                return cb(this._invalidAnnotationError(anno, validFn.errors))
            }
            // TODO no idempotency of targets with normalization -> disabled for now
            // anno = this._normalizeTarget(anno)
            anno = this._normalizeType(anno)
            const newData = JSON.parse(JSON.stringify(anno))
            anno.created = new Date()
            this.db.update({_id}, {
                $push: {_revisions: anno},
                $set: newData,
            }, {}, (err, arg) => {
                if (err) return cb(err)
                options.latest = true
                return this.get(_id, options, cb)
            })
        })
    }

    /* @override */
    delete(annoId, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        const _id = this._idFromURL(annoId)
        this.db.update({_id}, {$set: {deleted: new Date()}}, (err) => {
            if (err) return cb(err)
            return cb()
        })
    }

    /* @override */
    search(query, options, cb) {
        if (typeof query   === 'function') [cb, query, options] = [query, {}, {}]
        if (typeof options === 'function') [cb, options] = [options, {}]

        if ('$target' in query) {
            query.$or = [
                { target: query.$target },
                { 'target.source': query.$target },
            ]
            delete query.$target
        }
        if (query.includeDeleted) {
            delete query.includeDeleted
        } else {
            query.deleted = {$exists: false}
        }

        const projection = this._projectionFromOptions(options)

        console.log(JSON.stringify({query, projection}, null, 2))
        this.db.find(query, projection, (err, docs) => {
            if (err) return cb(err)
            if (docs === undefined) docs = []
            // mongodb returns a cursor, nedb a list of documents
            if (Array.isArray(docs))
                return cb(null, docs.map(doc => this._toJSONLD(doc, {skipContext: true})))
            else
                docs.toArray((err, docs) => {
                    if (err) return cb(err)
                    return cb(null, docs.map(doc => this._toJSONLD(doc, {skipContext: true})))
                })
        })
    }

    /* ******************************************
     * Protected API
     * ******************************************
     */
    _toJSONLD(annoId, anno, options={}) {
        if (typeof annoId === 'object') [annoId, anno] = [annoId._id, annoId]
        const ret = {}
        if (!options.skipContext) {
            ret['@context'] = 'http://www.w3.org/ns/anno.jsonld'
        }
        ret.id = `${this.config.BASE_URL}/anno/${annoId}`
        ret.type = "Annotation"
        Object.keys(anno).forEach(prop => {
            if (prop === '_revisions') {
                if (anno._revisions.length > 0 && !options.skipVersions) {
                    var revId = 0
                    ret.hasVersion = anno._revisions.map(revision => {
                        const revisionLD = this._toJSONLD(`${annoId}-rev-${++revId}`, revision,
                            {skipContext: true})
                        revisionLD.versionOf = ret.id
                        return revisionLD
                    })
                }
            } else if (!prop.match(/^_/)) {
                ret[prop] = anno[prop]
            }
        })

        return ret
    }

    _projectionFromOptions(options) {
        const ret = {}
        if (options.metadataOnly) {
            Object.assign(ret, {
                body: false,
                target: false,
            })
            // HACK
            for (let i = 0; i < 20; i++) {
                ret[`_revisions.${i}.body`] = false
                ret[`_revisions.${i}.target`] = false
            }
        }
        return ret
    }



}

module.exports = MongolikeStore
