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
    get(annoIds, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        const wasArray = Array.isArray(annoIds)
        if (!wasArray) annoIds = [annoIds]
        async.map(annoIds, (annoId, done) => {
            annoId = this._idFromURL(annoId)
            var [_id, _revid] = annoId.split(/-rev-/)
            this.db.findOne({_id}, (err, doc) => {
                if (err) return done(err)
                if (!doc) return done(this._annotationNotFoundError(annoId))
                const rev = (_revid) 
                    ? doc._revisions[_revid -1]
                    : doc._revisions[doc._revisions.length - 1]
                if (!rev) return done(this._revisionNotFoundError(_id, _revid))
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
            if (!schema.validate.AnnotationToPost(anno)) {
                return errors.push(schema.validate.AnnotationToPost.errors)
            }
            anno = this._normalizeTarget(anno)
            anno = this._normalizeType(anno)
            anno._revisions = [JSON.parse(JSON.stringify(anno))]
            const created = new Date()
            anno.modified = created
            anno.created = created
            anno._revisions[0].created = created
            return anno
        })
        if (errors.length > 0) return cb(errors)
        this.db.insert(annosToCreate, (err, savedAnnos) => {
            if (err) return cb(err)
            if (!wasArray) return this.get(savedAnnos[0]._id, cb)
            return this.get(savedAnnos.map(savedAnno => savedAnno._id), cb)
        })
    }

    /* @override */
    createRevision(annoId, anno, cb) {
        const _id = this._idFromURL(annoId)
        this.db.count({_id}, (err, count) => {
            if (err) return cb(err)
            if (count !== 1) return cb(this._notFoundException(_id))
            anno = this._deleteId(anno)
            if (!schema.validate.AnnotationToPost(anno)) {
                return cb(schema.validate.AnnotationToPost.errors)
            }
            anno = this._normalizeTarget(anno)
            anno = this._normalizeType(anno)
            anno.created = new Date()
            this.db.update({_id}, {
                $push: {_revisions: anno},
                $set: {modified: anno.created},
            }, {}, cb)
        })
    }

    /* @override */
    delete(annoId, cb) {
        const _id = this._idFromURL(annoId)
        this.db.update({_id}, {$set: {deleted: new Date()}}, (err) => {
            if (err) return cb(err)
            return cb()
        })
    }

    /* @override */
    search(query, cb) {
        if (typeof query === 'function') [cb, query] = [query, {}]
        const _options = {}
        if ('$target' in query) {
            query.$or = [
                { target: query.$target },
                { 'target.source': query.$target },
            ]
            delete query.$target
        }
        // console.log(JSON.stringify(query, null, 2))
        this.db.find(query, _options, (err, docs) => {
            if (err) return cb(err)
            docs = (docs || [])
            // console.log(docs)
            return cb(null, docs.map(doc => this._toJSONLD(doc)))
        })
    }

    /* ******************************************
     * Protected API
     * ******************************************
     */
    _traverseChain(parent, chain, cb) {
        var anno = parent
        var lastPath;
        for (var i = 0; i < chain.length ; i += 2) {
            var [path, length] = chain.slice(i, i+2)
            if (path === 'rev') path = '_revisions'
            else if (path === 'comment') path = '_comments'
            else return cb(`Invalid chain: ${JSON.stringify(chain)}`)
            length = parseInt(length)
            if (!anno[path]) return cb(`Invalid chain: ${JSON.stringify(chain)}`)
            if (!anno[path][length]) return cb(`Invalid chain: ${JSON.stringify(chain)}`)
            anno = anno[path][length]
            lastPath = path
        }
        if (chain.length > 2) {
            const parentId = `${this.config.BASE_URL}/anno/${chain.slice(0, chain.length -2).join('/')}`
            if (lastPath === 'comment') anno.target = [parentId]
            else anno[this.config.PROP_VERSION_OF] = parentId
        }
        return cb(null, anno)
    }

    _toJSONLD(annoId, anno, options={}) {
        if (typeof annoId === 'object') [annoId, anno] = [annoId._id, annoId]
        const ret = {}
        if (!options.skipContext) {
            ret['@context'] = 'http://www.w3.org/ns/anno.jsonld'
        }
        ret.id = `${this.config.BASE_URL}/anno/${annoId}`
        ret.type = "Annotation"
        if (anno.body) ret.body = anno.body
        if (anno.target) ret.target = anno.target

        if (anno._revisions !== undefined && anno._revisions.length > 0) {
            var revId = 0
            ret.hasVersion = anno._revisions.map(revision => {
                const revisionLD = this._toJSONLD(`${annoId}-rev-${++revId}`, revision,
                    {skipContext: true})
                revisionLD[config.PROP_VERSION_OF] = ret.id
                return revisionLD
            })
        }

        // if (anno._comments !== undefined && anno._comments.length > 0) {
        //     var commentId = 0
        //     ret[config.PROP_HAS_COMMENT] = anno._comments.map(comment => {
        //         const commentLD = this._toJSONLD(`${annoId}/comment/${commentId}`, comment,
        //             {skipContext: true})
        //         commentLD.target = [ret.id]
        //         return commentLD
        //     })
        // }

        return ret
    }



}

module.exports = MongolikeStore
