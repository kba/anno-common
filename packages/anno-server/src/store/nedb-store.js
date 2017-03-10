const ns = require('../ns')
const config = require('../config')()

class NedbStore {

    constructor({db, config}) {
        this.db = db
    }

    _toJSONLD(annoId, anno, options={}) {
        const ret = {}
        if (!options.skipContext) {
            ret['@context'] = 'http://www.w3.org/ns/anno.jsonld'
        }
        ret.id = `${config.BASE_URL}/anno/${annoId}`
        ret.type = "Annotation"
        if (anno.body) ret.body = anno.body

        if (anno._revisions !== undefined && anno._revisions.length > 0) {
            var revId = 0
            ret[ns.PROP_HAS_VERSION] = anno._revisions.map(revision => {
                const revisionLD = this._toJSONLD(`${annoId}/rev/${revId}`, revision,
                    {skipContext: true})
                revisionLD[ns.PROP_VERSION_OF] = ret.id
                return revisionLD
            })
        }

        if (anno._comments !== undefined && anno._comments.length > 0) {
            var commentId = 0
            ret[ns.PROP_HAS_COMMENT] = anno._comments.map(comment => {
                const commentLD = this._toJSONLD(`${annoId}/comment/${commentId}`, comment,
                    {skipContext: true})
                commentLD.target = [ret.id]
                return commentLD
            })
        }

        return ret
    }

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
            const parentId = `${config.BASE_URL}/anno/${chain.slice(0, chain.length -2).join('/')}`
            if (lastPath === 'comment') anno.target = [parentId]
            else anno[ns.PROP_VERSION_OF] = parentId
        }
        return cb(null, anno)
    }

    getAnnotation(annoId, chain, cb) {
        if (typeof chain === 'function') {
            [cb, chain] = [chain, []]
        }
        this.db.anno.findOne({_id: annoId}, (err, doc) => {
            if (err) return cb(err)
            if (!doc) return cb(404)
            this._traverseChain(doc, chain, (err, anno) => {
                if (err) return cb(err)
                const id = `${annoId}/${chain.join('/')}`.replace(/\/$/,'')
                return cb(null, this._toJSONLD(id, anno))
            })
        })
    }

    createNewAnnotation(annoDoc, cb) {
        this.db.anno.insert(annoDoc, function(err) {
            if (err) return cb(err)
            return cb (null, arguments)
        })
    }

    searchAnnotations(query, cb) {
        this.db.anno.find({}, function(err, docs) {
            if (err) return cb(err)
            return cb(null, docs)
        })
    }

}

module.exports = NedbStore
