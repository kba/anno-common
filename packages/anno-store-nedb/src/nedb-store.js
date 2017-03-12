const nedb = require('nedb')
const fs = require('fs')
const Store = require('@kba/anno-store')

const config = require('@kba/anno-config').loadConfig({})
const schema = require('@kba/anno-schema')

class NedbStore extends Store {

    constructor() {
        super()
        this.dbfilename = `${config.NEDB_DIR}/anno.nedb`
        this.db = new nedb({filename: this.dbfilename})
    }

    init(cb) {
        this.db.loadDatabase(err => {
            if (err) return cb(err)
            return cb()
        })
    }

    wipe(cb) {
        fs.unlink(this.dbfilename, err => {
            if (err && err.code !== 'ENOENT')
                return cb(err)
            return this.init(cb)
        })
    }

    get(annoId, chain, cb) {
        if (typeof chain === 'function') {
            [cb, chain] = [chain, []]
        }
        annoId = this._idFromURL(annoId)
        this.db.findOne({_id: annoId}, (err, doc) => {
            if (err) return cb(err)
            if (!doc) return cb(this._notFoundException({_id: annoId}))
            this._traverseChain(doc, chain, (err, anno) => {
                if (err) return cb(err)
                const id = `${annoId}/${chain.join('/')}`.replace(/\/$/,'')
                return cb(null, this._toJSONLD(id, anno))
            })
        })
    }

    create(annoDoc, cb) {
        annoDoc = JSON.parse(JSON.stringify(annoDoc))
        if (!schema.validate.AnnotationToPost(annoDoc)) {
            return cb(schema.validate.AnnotationToPost.errors)
        }
        annoDoc = this._normalizeTarget(annoDoc)
        this.db.insert(annoDoc, (err, annoSaved) => {
            if (err) return cb(err)
            return cb (null, this._toJSONLD(annoSaved))
        })
    }

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

}

module.exports = NedbStore
