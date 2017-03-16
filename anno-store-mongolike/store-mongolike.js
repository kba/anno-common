const {Store} = require('@kba/anno-store')
const config = require('@kba/anno-config').loadConfig({
    COLLECTION: 'default'
})
const schema = require('@kba/anno-schema')

class MongolikeStore extends Store {

    constructor(...args) { super(...args) }

    init(cb) { throw(new Error("Must override 'init'")) }
    wipe(cb) { throw(new Error("Must override 'init'")) }

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

    create(annosToCreate, cb) {
        annosToCreate = JSON.parse(JSON.stringify(annosToCreate))
        var wasArray = true
        if (!Array.isArray(annosToCreate)) {
            wasArray = false
            annosToCreate = [annosToCreate]
        }
        const errors = []
        annosToCreate = annosToCreate.map(anno => {
            if (!schema.validate.AnnotationToPost(anno)) {
                return errors.push(schema.validate.AnnotationToPost.errors)
            }
            anno = this._normalizeTarget(anno)
            anno = this._normalizeType(anno)
            return anno
        })
        if (errors.length > 0) return cb(errors)
        this.db.insert(annosToCreate, (err, saved) => {
            if (err) return cb(err)
            if (!wasArray && saved.length === 1) {
                return cb (null, this._toJSONLD(saved[0]))
            }
            return cb(null, saved.map(this._toJSONLD.bind(this)))
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

module.exports = MongolikeStore
