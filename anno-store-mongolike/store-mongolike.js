const Store = require('@kba/anno-store')
const schema = require('@kba/anno-schema')
const async = require('async')
const errors = require('@kba/anno-errors')
const {loadConfig} = require('@kba/anno-config')

class MongolikeStore extends Store {

    constructor(...args) { super(...args) }

    /* @override */
    _wipe(options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        throw(new Error("Must override '_wipe'"))
    }

    /* @override */
    _disconnect(options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        return cb();
    }

    /* @override */
    _get(options, cb) {
        var annoId = options.annoId
        const projection = this._projectionFromOptions(options)
        annoId = this._idFromURL(annoId)
        var {_id, _revid} = this._splitIdRev(annoId)
        const query = {_id, deleted: {$exists: false}}
        this.db.findOne(query, projection, (err, doc) => {
            if (err) return cb(err)
            if (!doc) return cb(errors.annotationNotFound(annoId))
            const rev = (_revid) 
                ? doc._revisions[_revid -1]
                : doc._revisions[doc._revisions.length - 1]
            if (!rev) return cb(errors.revisionNotFound(_id, _revid))
            if (options.latest) {
                annoId = `${_id}-rev-${doc._revisions.length}`
                doc = rev
            }
            return cb(null, this._toJSONLD(annoId, doc, options))
        })
    }

    /* @override */
    _create(options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        var anno = JSON.parse(JSON.stringify(options.anno))
        anno = this._deleteId(anno)
        const validFn = schema.validate.Annotation
        // console.log(anno)
        if (!validFn(anno)) {
            return cb(errors.invalidAnnotation(anno, validFn.errors))
        }
        anno = this._normalizeTarget(anno)
        anno = this._normalizeType(anno)

        // TODO Handle replies
        // TODO move to util
        // const targetUrl = (typeof anno.target === 'string')
        //     ? anno.target : anno.target.id
        //     ? anno.target.id : anno.target.source
        //     ? anno.target.source : anno.target.scope
        //     ? anno.target.scope : ''
        // if (targetUrl.match(loadConfig().BASE_URL)) {
        //     const replyToId = this._idFromURL(targetUrl)
        //     anno._replyTo = 
        // }
        anno._replies = []

        // Handle revisions
        anno._revisions = [JSON.parse(JSON.stringify(anno))]
        const created = new Date().toISOString()
        anno.modified = created
        anno.created = created
        anno._revisions[0].created = created

        if (anno.replyTo) {
            const _id = this._idFromURL(anno.replyTo)
            this.db.findOne({_id}, (err, existingAnno) => {
                if (err) return cb(err)
                if (!existingAnno) return cb(errors.annotationNotFound(anno.replyTo))
                anno.id = anno.replyTo + '-reply-' + (existingAnno._replies).length
                this.db.update({_id}, {$push: {_replies: anno}}, (err, arg) => {
                    // TODO differentiate, use errors from anno-errors
                    if (err) return cb(err)
                    options.latest = true
                    delete options.annoId
                    delete options.anno
                    return this.get(anno.id, options, cb)
                })
            })
        } else {
            anno._id = this._genid()
            this.db.insert(anno, (err, savedAnno) => {
                // TODO differentiate, use errors from anno-errors
                if (err) return cb(err)
                // Mongodb returns an object describing the result, nedb returns just the results
                if ('insertedIds' in savedAnno)
                    return this.get(savedAnno.insertedIds[0], options, cb)
                else
                    return this.get(savedAnno._id, options, cb)
            })
        }
    }

    // https://www.w3.org/TR/annotation-protocol/#update-an-existing-annotation
    /* @override */
    _revise(options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        const annoId = this._idFromURL(options.annoId)
        var anno = options.anno
        var {_id, _revid} = this._splitIdRev(annoId)
        this.db.findOne({_id}, (err, existingAnno) => {
            if (err) return cb(err)
            if (!existingAnno) return cb(errors.annotationNotFound(_id))
            ;['canonical', 'via', 'hasVersion', 'versionOf'].forEach(prop => {
                // TODO should be deepEqual not ===
                if (anno[prop] && anno[prop] !== existingAnno[prop]) {
                    return cb(errors.readonlyValue(annoId, 'canonical'))
                }
            })
            var newData = JSON.parse(JSON.stringify(anno))
            newData.created = new Date().toISOString()
            this._deleteId(newData)
            this._normalizeType(newData)
            const validFn = schema.validate.Annotation
            if (!validFn(newData)) {
                return cb(errors.invalidAnnotation(anno, validFn.errors))
            }
            // TODO no idempotency of targets with normalization -> disabled for now
            // anno = this._normalizeTarget(anno)
            this.db.update({_id}, {
                $push: {_revisions: newData},
                $set: newData,
            }, {}, (err, arg) => {
                if (err) return cb(err)
                options.latest = true
                delete options.anno
                return this.get(_id, options, cb)
            })
        })
    }

    /* @override */
    _delete(options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        const _id = this._idFromURL(options.annoId)
        this.db.update({_id}, {$set: {deleted: new Date()}}, (err) => {
            if (err) return cb(err)
            return cb()
        })
    }

    /* @override */
    _search(options, cb) {
        var {query} = options 

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

        // console.log(JSON.stringify({query, projection}, null, 2))
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
            } else if (prop === '_replies') {
                if (anno._replies.length > 0 && !options.skipReplies) {
                    var replyId = 0
                    ret.hasReply = anno._replies.map(reply => {
                        const replyLD = this._toJSONLD(`${annoId}-rev-${++replyId}`, reply,
                            {skipContext: true})
                        replyLD.replyTo = ret.id
                        return replyLD
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
