function load(loadingModule) {
    const config = require('@kba/anno-config').loadConfig()
    if (!loadingModule)
        throw new Error("Must pass the loading module to Store.load")
    if (!config.STORE)
        throw new Error("No store configured. Set the ANNO_STORE env var or STORE config option.")
    if (config.DEBUG)
        console.log(`Loading store ${config.STORE} for ${loadingModule.filename}`)
    var impl;
    try {
        impl = loadingModule.require(config.STORE)
    } catch (err) {
        console.error(`Please install '${config.STORE}' configured as store`)
    }
    return new(impl)()
}

class Store {

    constructor() {
        this.config = require('@kba/anno-config').loadConfig()
        console.log(this.config)
        // console.error("Store.constructor called")
    }

    /*
     * Public API
     */

    init(cb) { return cb() }
    wipe(cb) { throw new Error("wipe not implemented"); }

    /**
     * Create an annotation.
     *
     * @param {Object|Array<Object>} annosToCreate
     * @param {Options={}} options
     * @param String options.slug Proposal for the ID to create
     * @param {function} callback
     */
    create(annosToCreate, options, cb) { throw new Error("create not implemented") }

    /**
     * Create an annotation.
     *
     * @param {String} annoId
     * @param {Options={}} options
     * @param {function} callback
     */
    get(annoId, options, cb) { throw new Error("get not implemented") }

    /*
     * Protected API
     */

    _notFoundException(id) {
        const err = new Error(`Not found in store: ${JSON.stringify(id)}`)
        err.code = 404
        return err
    }

    _idFromURL(url) {
        return url.replace(this.config.BASE_URL + '/anno/', '')
    }

    _normalizeTarget(annoDoc) {
        if (!Array.isArray(annoDoc.target)) annoDoc.target = [annoDoc.target]
        annoDoc.target = annoDoc.target.map(target =>
            (typeof target === 'string') ? {source: target} : target)
        if (annoDoc.target.length === 1) annoDoc.target = annoDoc.target[0]
        return annoDoc
    }

    _normalizeType(annoDoc) {
        if (!('type' in annoDoc)) annoDoc.type = []
        if (!Array.isArray(annoDoc.type)) annoDoc.type = [annoDoc.type]
        if (annoDoc.type.indexOf('Annotation') === -1) annoDoc.type.push('Annotation')
        return annoDoc
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

        // if (anno._revisions !== undefined && anno._revisions.length > 0) {
        //     var revId = 0
        //     ret[config.PROP_HAS_VERSION] = anno._revisions.map(revision => {
        //         const revisionLD = this._toJSONLD(`${annoId}/rev/${revId}`, revision,
        //             {skipContext: true})
        //         revisionLD[config.PROP_VERSION_OF] = ret.id
        //         return revisionLD
        //     })
        // }

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

}

module.exports = {Store, load}
