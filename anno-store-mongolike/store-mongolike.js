const Store = require('@kba/anno-store')
const schema = require('@kba/anno-schema')
const errors = require('@kba/anno-errors')
const async = require('async')
const {
  splitIdRepliesRev,
  truthy,
} = require('@kba/anno-util')

class MongolikeStore extends Store {

    constructor(...args) {super(...args)}

    /* @override */
    _wipe(options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        throw new Error("Must override '_wipe'")
    }

    /* @override */
    _disconnect(options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        return cb()
    }

    /* @override */
    _get(options, cb) {
        let annoId = this._idFromURL(options.annoId)
        const projection = this._projectionFromOptions(options)
        let {_id, _replyids, _revid} = splitIdRepliesRev(annoId)
        const query = {_id}
        this.db.findOne(query, projection, (err, doc) => {
            if (!doc)
                return cb(errors.annotationNotFound({annoId, _id, _replyids, _revid}))
            for (let _replyid of _replyids) {
                // console.log({doc, _replyid})
                doc = doc._replies[_replyid - 1]
                if (!doc) {
                    return cb(errors.replyNotFound(annoId))
                }
            }
            if (doc.deleted && !options.includeDeleted)
                return cb(errors.annotationDeleted(annoId, doc.deleted))
            this._handleRevisions(annoId, doc, options, cb)
        })
    }

    /* @override */
    _create(options, cb) {
        let anno = JSON.parse(JSON.stringify(options.anno))
        anno = this._deleteId(anno)
        // anno = this._normalizeTarget(anno)
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
        this.db.insert(anno, (err, doc) => {
            // TODO differentiate, use errors from anno-errors
            if (err) return cb(err)

            // Mongodb returns an object describing the result, nedb returns just the results
            const _id = ('insertedIds' in doc) ? doc.insertedIds[0] : doc._id
            return this.get(_id, options, cb)
        })
    }

    _createReply(anno, options, cb) {
        const validFn = schema.validate.Annotation
        if (!validFn(anno)) {
            return cb(errors.invalidAnnotation(anno, validFn.errors))
        }
        const {_id, _replyids} = splitIdRepliesRev(this._idFromURL(anno.replyTo))
        this.db.findOne({_id}, (err, existingAnno) => {
            if (err)
                return cb(err)
            if (!existingAnno)
                return cb(errors.annotationNotFound(anno.replyTo))
            let selector = ''
            let parent = existingAnno
            if (_replyids.length > 0) {
                _replyids.forEach(_replyid => {
                    selector += `_replies.${_replyid - 1}.`
                    parent = parent._replies[_replyid - 1]
                })
            }
            const replyFullId = this._idFromURL(anno.replyTo + '.' + (parent._replies.length + 1))
            // console.log("CREATEREPLY", {replyFullId, selector})
            // console.log("CREATEREPLY", JSON.stringify({replyFullId, anno}, null, 2))
            this.db.update({_id}, {$push: {[selector+'_replies']: anno}}, (err, arg) => {
                // TODO differentiate, use errors from anno-errors
                if (err) return cb(err)
                // options.latest = true
                delete options.annoId
                delete options.anno
                return this.get(replyFullId, options, cb)
            })
        })
    }


    /* @override */
    _import(options, cb) {
        let {anno, recursive, slug, replaceAnnotation, updateAnnotation} = options
        // console.log("import options", {options})
        if (replaceAnnotation && updateAnnotation)
            return cb(new Error("'replaceAnnotation' contradicts 'updateAnnotation'"))
        if (!replaceAnnotation && !updateAnnotation)
            return cb(new Error("Either 'replaceAnnotation' or 'updateAnnotation'"))
        if (replaceAnnotation && !slug)
            return cb(new Error("'replaceAnnotation' requires 'slug'!"))
        if (replaceAnnotation && !recursive)
            return cb(new Error("'replaceAnnotation' will clobber exixsting annotations unless 'recursive' is set!"))

        const _fullid = slug ? slug : this._genid()
        const {_id, _replyids} =  splitIdRepliesRev(_fullid)
        const isReply = !! _replyids.length

        this.get(_fullid, options, (err, existingAnno) => {
            const found = !err && existingAnno
            if (!found && (updateAnnotation)) {
                return cb(new Error(`'replaceAnnotation'/'updateAnnotation' are set, but annotation ${_fullid} wasn't found`))
            }
            // console.log({anno})
            anno = this.jsonldToMongolike(anno, options)
            // console.log({anno})
            if (!recursive) {
                delete anno._revisions
                delete anno._replies
            }
            // TODO support revisions and replies
            if (replaceAnnotation) {
                if (isReply) {
                    // TODO implement replacement of replies
                    return cb(errors.notImplemented(
                        'import/replaceAnnotation/reply',
                        "Replacing replies currently not implemented"
                    ))
                } else {
                    Object.assign(anno, {_id})
                    this.db.remove({_id}, options, (err) => {
                        if (err) return cb(err)
                        this._createInsert(anno, options, cb)
                    })
                }
            } else if (updateAnnotation) {
                if (isReply) {
                    const selector = _replyids.map(_replyid => `_replies.${_replyid - 1}`).join('.')
                    // Prepend the selector to all fields that should be replaced
                    const $set = Object.keys(anno).reduce((ret, k) => {
                        ret[`${selector}.${k}`] = anno[k]
                        return ret
                    }, {})
                    console.log("Import", {_id, $set})
                    this.db.update({_id}, {$set}, {}, (err, arg) => {
                        if (err) return cb(err)
                        this.get(_fullid, options, cb)
                    })
                } else {
                    this.db.update({_id}, {$set: anno}, (err) => {
                        if (err) return cb(err)
                        this.get(_fullid, options, cb)
                    })
                }
            }
        })
    }

    /* @override */
    _revise(options, cb) {
        const annoId = this._idFromURL(options.annoId)
        let anno = options.anno
        const {_id, _replyids, _unversioned} = splitIdRepliesRev(annoId)
        this.db.findOne({_id}, (err, existingAnno) => {
            if (err)
                return cb(err)
            if (!existingAnno)
                return cb(errors.annotationNotFound(_id))

            // TODO Handle read-only values
            for (let prop of ['canonical', 'via', 'hasReply', 'replyTo', 'hasVersion', 'versionOf']) {
                // TODO should be deepEqual not ===
                if (anno[prop] && anno[prop] !== existingAnno[prop]) {
                    // console.log(errors.readonlyValue(annoId, prop, existingAnno[prop], anno[prop]))
                    // delete anno[prop]
                }
            }
            const annoRevision = JSON.parse(JSON.stringify(anno))

            annoRevision.created = new Date().toISOString()
            // A revision cannot be modified
            delete annoRevision.modified
            // Never change creator attribute
            delete annoRevision.creator
            // A revision should not have an id TODO
            this._deleteId(annoRevision)
            this._normalizeType(annoRevision)

            const validFn = schema.validate.Annotation
            if (!validFn(annoRevision)) {
                return cb(errors.invalidAnnotation(anno, validFn.errors))
            }

            const annoRoot = JSON.parse(JSON.stringify(annoRevision))
            // Last modification of the annotation is the creation date of its newest revision
            annoRoot.modified = annoRevision.created

            let modQueries
            // walk replies and add revision
            if (_replyids.length > 0) {
                //
                // Revising a reply
                //

                // A selector that drills down to the nesting level of the reply (e.g. '_replies.1._replies.3._replies.7')
                const selector = _replyids.map(_replyid => `_replies.${_replyid - 1}`).join('.')

                // Prepend the selector to all fields that should be replaced
                const setQuery = {}
                Object.keys(annoRoot).forEach(k => setQuery[`${selector}.${k}`] = annoRoot[k])
                modQueries = [
                    {$set: setQuery},
                    {$push: {[selector + '._revisions']: annoRevision}},
                ]
            } else {
                //
                // Revising a 'top-level' annotation
                //

                // Never change the creation date of a top-level annotation
                delete annoRoot.created
                modQueries = [
                    {$set: annoRoot},
                    {$push: {_revisions: annoRevision}},
                ]
            }
            // console.log("REVISERINO", JSON.stringify({_id, modQueries}, null, 2))
            this.db.update({_id}, modQueries[0], {}, (err, arg) => {
                if (err) return cb(err)
                this.db.update({_id}, modQueries[1], {}, (err, arg) => {
                    if (err) return cb(err)
                    delete options.anno
                    // TODO Make this optional via envyconf var
                    if (anno.doi) {
                        this.mintDoi(_unversioned, options, (err, anno) => {
                            if (err) return cb(err)
                            return cb(null, anno)
                        })
                    } else {
                        Object.assign(options, {latest: true})
                        return this.get(_id, options, cb)
                    }
                })
            })
        })
    }

    /* @override */
    _delete(options, cb) {
        const {_id, _replyids} = splitIdRepliesRev(this._idFromURL(options.annoId))
        if (options.forceDelete) {
            // console.log("FORCE DELETE", options)
            this.db.remove({_id}, (err, numRemoved) => {
                if (err) return cb(err)
                return cb()
            })
        }
        let selector = ''
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
        const {query} = options

        const asRegex = truthy(query.$regex)
        delete query.$regex

        const nested = truthy(query.$nested)

        if (!options.includeDeleted) {
            query.deleted = {$exists: false}
        }

        if ('$target' in query) {
            const needle = asRegex ? {$regex: query.$target} : query.$target
            query.$or = [
                {target: needle},
                {'target.id': needle},
                {'target.scope': needle},
                {'target.source': needle},
            ]
            delete query.$target
        }

        if (asRegex) {
            Object.keys(query).forEach(k => {
                if (typeof query[k] === 'string') {
                    query[k] = {$regex: query[k]}
                }
            })
        }

        // XXX UNDOCUMENTED
        if (nested) {
            if (!query.$or)
                query.$or = []
            for (let i = 0; i < 20; i++) {
                const queryHere = {}
                // TODO BROKEN _reply should be _replies?
                for (let clause in query) {
                    queryHere[`_reply.${i}.${clause}`] = JSON.parse(JSON.stringify(query[clause]))
                }
                query.$or.push(queryHere)
            }
        }


        const projection = this._projectionFromOptions(options)

        // console.log(JSON.stringify({query, projection}, null, 2))
        this.db.find(query, projection, (err, docs) => {
            if (err) return cb(err)
            if (docs === undefined) docs = []
            options.skipContext = true

            // mongodb returns a cursor, nedb a list of documents
            const docsToArray = (docs, cb) => Array.isArray(docs) ? cb(null, docs) : docs.toArray(cb)
            docsToArray(docs, (err, docs) => {
                // console.log('docsToArray', {err, docs, options})
                if (err) return cb(err)
                async.map(docs, (doc, done) => {
                    this._handleRevisions(doc._id, doc, options, done)
                }, cb)
            })
        })
    }

    /* ******************************************
     * Protected API
     * ******************************************
     */
    _toJSONLD(annoId, anno, options={}, mergeProps={}) {
        // console.log(annoId, options)
        // console.log('_toJSONLD', {annoId, options})
        if (typeof annoId === 'object') [annoId, anno] = [annoId._id, annoId]
        options = Object.assign({filterProps: []}, options)
        const ret = Object.assign({}, mergeProps)
        if (!options.skipContext) {
            ret['@context'] = 'http://www.w3.org/ns/anno.jsonld'
        }
        ret.id = this._urlFromId(annoId)
        ret.type = "Annotation"
        options.skipContext = true
        Object.keys(anno)
            .filter(prop => options.filterProps.indexOf(prop) === -1)
            .forEach(prop => {
            if (prop === '_revisions' && !(annoId.match(/~\d$/))) {
                if (anno._revisions.length > 0 && options.filterProps.indexOf('hasVersion') === -1) {
                    let revId = 0
                    ret.hasVersion = anno._revisions.map(revision => {
                        const revisionLD = this._toJSONLD(`${annoId}~${++revId}`, revision, options, {
                            versionOf: ret.id
                        })
                        return revisionLD
                    })
                }
            // TODO sort before _revisions
            } else if (prop === '_replies') {
                if (anno._replies.length > 0 && options.filterProps.indexOf('hasReply') === -1) {
                    let replyId = 0
                    ret.hasReply = anno._replies
                        .map(reply => {
                            const replyLD = this._toJSONLD(`${annoId}.${++replyId}`, reply, options)
                            replyLD.replyTo = ret.id
                            return replyLD
                        })
                        .filter(reply => ! reply.deleted)
                }
            } else if (!prop.match(/^_/) && !(prop in ret)) {
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

    jsonldToMongolike(anno, options) {
        options = Object.assign({
            filterProps: []
        }, JSON.parse(JSON.stringify(options)))
        // ALWAY filter @context and id
        options.filterProps.push(['id', '@context'])
        const {filterProps} = options
        anno = this._normalizeType(anno)
        const ret = {}
        // Recursively replace hasVersion -> _revisions, hasReply -> _replies
        Object.keys(anno)
            .filter(prop => filterProps.indexOf(prop) === -1 )
            .forEach(prop => {
                if (prop == 'hasVersion') {
                    ret._revisions = anno[prop].map(x => this.jsonldToMongolike(x, options))
                    delete anno[prop]
                } else if (prop == 'hasReply') {
                    ret._replies = anno[prop].map(x => this.jsonldToMongolike(x, options))
                    delete anno[prop]
                } else {
                    ret[prop] = anno[prop]
                }
            })
        if (!ret._revisions) {
            const woReplies = JSON.parse(JSON.stringify(ret))
            delete woReplies._replies
            delete woReplies.id
            ret._revisions = [woReplies]
        }
        ret._revisions = ret._revisions || []
        ret._replies = ret._replies || []
        return ret
    }

    _handleRevisions(annoId, doc, options, cb) {
        // console.log('_handleRevisions', {annoId, _id: doc._id})
        const {_id, _unversioned, _revid, _replyids} = splitIdRepliesRev(annoId)
        if (!Array.isArray(doc._revisions)) {
            console.error("!!!! Database Error !!!! Annotation without _revisions", _unversioned)
        } else {

            const latestRevision = doc._revisions[doc._revisions.length - 1]

            const rev = (_revid)
                ? doc._revisions[_revid -1]
                : latestRevision

            if (!rev)
                return cb(errors.revisionNotFound(_unversioned, _revid))

            if (options.latest) {
                annoId = `${_unversioned}~${doc._revisions.length}`
                doc = rev
            }

            // Always send the DOI of the latest revision as the DOI of the TLA
            // so people can cite this correctly
            if (latestRevision.doi)
                doc.doi = latestRevision.doi

            // XXX TODO use urlJoin and such
            if (_replyids.length) doc.replyTo = this._urlFromId(`${_id}${_replyids.map(x=>`.${x}`).join('')}`)
            if (_revid) doc.versionOf = this._urlFromId(_id)
        }
        return cb(null, this._toJSONLD(annoId, doc, options))
    }

}

module.exports = MongolikeStore

// vim: sw=4
