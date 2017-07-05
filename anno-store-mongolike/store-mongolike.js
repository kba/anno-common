const Store = require('@kba/anno-store')
const schema = require('@kba/anno-schema')
const async = require('async')
const errors = require('@kba/anno-errors')
const {splitIdRepliesRev} = require('@kba/anno-util')

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
    // TODO replies!
    _get(options, cb) {
        var annoId = this._idFromURL(options.annoId)
        const projection = this._projectionFromOptions(options)
        var {_id, _replyids, _revid} = splitIdRepliesRev(annoId)
        const query = {_id, deleted: {$exists: false}}
        this.db.findOne(query, projection, (err, doc) => {
            if (!doc) return cb(errors.annotationNotFound(annoId))
            for (let _replyid of _replyids) {
                // console.log({doc, _replyid})
                doc = doc._replies[_replyid - 1]
                if (!doc) {
                    return cb(errors.replyNotFound(annoId))
                }
            }
            const rev = (_revid)
                ? doc._revisions[_revid -1]
                : doc._revisions[doc._revisions.length - 1]
            if (!rev) return cb(errors.revisionNotFound(_id, _revid))

            if (options.latest) {
                annoId = `${_id}~${doc._revisions.length}`
                doc = rev
            }

            if (_replyids.length) doc.replyTo = this._urlFromId(`${_id}${_replyids.map(x=>`.${x}`).join('')}`)
            if (_revid) doc.versionOf = this._urlFromId(_id)
            return cb(null, this._toJSONLD(annoId, doc, options))
        })
    }

    /* @override */
    _create(options, cb) {
        var anno = JSON.parse(JSON.stringify(options.anno))
        anno = this._deleteId(anno)
        anno = this._normalizeTarget(anno)
        anno = this._normalizeType(anno)

        anno._replies = []

        // Handle revisions
        anno._revisions = [JSON.parse(JSON.stringify(anno))]
        const created = anno.created || new Date().toISOString()
        anno.modified = created
        anno.created = created
        anno._revisions[0].created = created

        if (anno.replyTo) {
            this._createReply(anno, options, cb)
        } else if (options.slug) {
            anno._id = options.slug
            this.db.count({_id: anno._id}, (err, count) => {
                if (count > 0) {
                    console.log(cb(errors.badSlug(options.slug)))
                    anno._id += `_${this._genid()}`
                }
                this._createInsert(anno, options, cb)
            })
        } else {
            anno._id = this._genid()
            this._createInsert(anno, options, cb)
        }
    }

    _createInsert(anno, options, cb) {
        const validFn = schema.validate.Annotation
        if (!validFn(anno)) {
            return cb(errors.invalidAnnotation(anno, validFn.errors))
        }
        if (options.collection) {
            anno.collection = options.collection
        }
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

    _createReply(anno, options, cb) {
        if (!anno.target || typeof anno.target === 'string') {
            anno.target = anno.replyTo
        } else {
            anno.target.id = anno.replyTo
        }
        const validFn = schema.validate.Annotation
        if (!validFn(anno)) {
            return cb(errors.invalidAnnotation(anno, validFn.errors))
        }
        const {_id, _replyids, _revid} = splitIdRepliesRev(this._idFromURL(anno.replyTo))
        this.db.findOne({_id}, (err, existingAnno) => {
            if (err)
                return cb(err)
            if (!existingAnno) 
                return cb(errors.annotationNotFound(anno.replyTo))
            var selector = '';
            let parent = existingAnno
            if (_replyids.length > 0) {
                _replyids.forEach(_replyid => {
                    selector += `_replies.${_replyid - 1}.`
                    parent = parent._replies[_replyid - 1]
                })
            }
            anno.id = anno.replyTo + '.' + ((parent._replies).length + 1)
            this.db.update({_id}, {$push: {[selector+'_replies']: anno}}, (err, arg) => {
                // TODO differentiate, use errors from anno-errors
                if (err) return cb(err)
                options.latest = true
                delete options.annoId
                delete options.anno
                return this.get(anno.id, options, cb)
            })
        })
    }

    /* @override */
    _import(options, cb) {
        var anno = options.anno
        const fromJSONLD = (anno) => {
            anno = this._normalizeType(anno)
            const ret = {}
            Object.keys(anno).forEach(prop => {
                if (prop == 'hasVersion') {
                    ret._revisions = anno[prop].map(fromJSONLD)
                    delete anno[prop]
                } else if (prop == 'hasReply') {
                    ret._replies = anno[prop].map(fromJSONLD)
                    delete anno[prop]
                } else {
                    ret[prop] = anno[prop]
                }
            })
            if (!ret._revisions) {
                const woReplies = JSON.parse(JSON.stringify(ret))
                delete woReplies._replies
                woReplies.id = `${woReplies}~1`
                ret._revisions = [woReplies]
            }
            ret._replies = ret._replies || []
            return ret
        }
        anno = fromJSONLD(anno)
        if (options.slug) {
            this.db.remove({_id: options.slug}, options, (err) => {
                anno._id = options.slug
                this._createInsert(anno, options, cb)
            })
        } else {
            anno._id = this._genid()
            this._createInsert(anno, options, cb)
        }
    }

    /* @override */
    _revise(options, cb) {
        const annoId = this._idFromURL(options.annoId)
        var anno = options.anno
        const {_id, _replyids, _revid} = splitIdRepliesRev(annoId)
        this.db.findOne({_id}, (err, existingAnno) => {
            if (err)
                return cb(err)
            if (!existingAnno)
                return cb(errors.annotationNotFound(_id))

            for (let prop of ['canonical', 'via', 'hasReply', 'replyTo', 'hasVersion', 'versionOf']) {
                // TODO should be deepEqual not ===
                if (anno[prop] && anno[prop] !== existingAnno[prop]) {
                    // TODO
                    // console.log(errors.readonlyValue(annoId, prop, existingAnno[prop], anno[prop]))
                    // delete anno[prop]
                }
            }
            var newData = JSON.parse(JSON.stringify(anno))
            newData.created = new Date().toISOString()
            this._deleteId(newData)
            this._normalizeType(newData)
            const validFn = schema.validate.Annotation
            if (!validFn(newData)) {
                return cb(errors.invalidAnnotation(anno, validFn.errors))
            }

            var modQueries;
            // walk replies and add revision
            if (_replyids.length > 0) {
                const selector = _replyids.map(_replyid => `_replies.${_replyid - 1}`).join('.')
                modQueries = [
                    {$set: {[selector]: newData}},
                    {$push: {[selector + '._revisions']: newData}},
                ]
            } else {
                modQueries = [
                    {$push: {_revisions: newData}},
                    {$set: newData},
                ]
            }
            // console.log(_id, ...modQueries)
            this.db.update({_id}, modQueries[0], {}, (err, arg) => {
                if (err) return cb(err)
                this.db.update({_id}, modQueries[1], {}, (err, arg) => {
                    if (err) return cb(err)
                    options.latest = true
                    delete options.anno
                    return this.get(_id, options, cb)
                })
            })
        })
    }

    /* @override */
    _delete(options, cb) {
        const {_id, _replyids, _revid} = splitIdRepliesRev(this._idFromURL(options.annoId))
        if (options.forceDelete) {
            console.log("FORCE DELETE", options)
            this.db.remove({_id}, (err, numRemoved) => {
                if (err) return cb(err)
                return cb()
            })
        }
        var selector = ''
        for (let _replyid of _replyids) {
            selector += `_replies.${_replyid - 1}.`
        }
        selector += 'deleted'
        // console.log(selector)
        this.db.update({_id}, {$set: {[selector]: new Date()}}, (err, nrModified) => {
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
                { 'target.id': query.$target },
                { 'target.scope': query.$target },
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
            options.skipContext = true
            // mongodb returns a cursor, nedb a list of documents
            if (Array.isArray(docs))
                return cb(null, docs.map(doc => this._toJSONLD(doc._id, doc, options)))
            else
                docs.toArray((err, docs) => {
                    if (err) return cb(err)
                    return cb(null, docs.map(doc => this._toJSONLD(doc._id, doc, options)))
                })
        })
    }

    /* ******************************************
     * Protected API
     * ******************************************
     */
    // TODO make recursive
    _toJSONLD(annoId, anno, options={}, mergeProps={}) {
        // console.log(annoId, options)
        if (typeof annoId === 'object') [annoId, anno] = [annoId._id, annoId]
        const ret = Object.assign({}, mergeProps)
        if (!options.skipContext) {
            ret['@context'] = 'http://www.w3.org/ns/anno.jsonld'
        }
        ret.id = this._urlFromId(annoId)
        ret.type = "Annotation"
        options.skipContext = true
        Object.keys(anno).forEach(prop => {
            if (prop === '_revisions' && !(annoId.match(/~\d$/))) {
                if (anno._revisions.length > 0 && !options.skipVersions) {
                    var revId = 0
                    ret.hasVersion = anno._revisions.map(revision => {
                        const revisionLD = this._toJSONLD(`${annoId}~${++revId}`, revision, options, {
                            versionOf: ret.id
                        })
                        return revisionLD
                    })
                }
            // TODO sort before _revisions
            } else if (prop === '_replies') {
                if (anno._replies.length > 0 && !options.skipReplies) {
                    let replyId = 0
                    ret.hasReply = anno._replies
                        .map(reply => {
                            const replyLD = this._toJSONLD(`${annoId}.${++replyId}`, reply, options)
                            replyLD.replyTo = ret.id
                            return replyLD
                        })
                        .filter(reply => ! reply.deleted)
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
                ret[`_revisions.${i}.body`]   = false
                ret[`_revisions.${i}.target`] = false
                ret[`_replies.${i}.body`]     = false
                ret[`_replies.${i}.target`]   = false
            }
        }
        return ret
    }



}

module.exports = MongolikeStore
