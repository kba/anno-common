const slugid = require('slugid')

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
        console.log(err)
        console.error(`Please install '${config.STORE}' configured as store`)
        process.exit(1)
    }
    return new(impl)()
}

class Store {

    constructor() {
        this.config = require('@kba/anno-config').loadConfig()
        console.log(this.config)
        // console.error("Store.constructor called")
    }

    /**
     * Initialize a connection to the store.
     *
     * @param {function} callback
     */
    init(cb) { return cb() }

    /**
     * Wipe the store, revisions and all.
     *
     * @param {function} callback
     *
     */
    wipe(cb) { cb(new Error("wipe not implemented")) }

    /**
     * Disconnect a store.
     *
     * A disconnected store cannot be used until `init` is called again.
     *
     * @param {function} callback
     */
    disconnect(cb) { return cb() }

    /**
     * Retrieve an annotation.
     *
     * @param {String|Array<String>} annoIds
     * @param {Options} options
     * @param {Options} options.latest Return the latest revision
     * @param {function} callback
     */
    get(annoIds, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        cb(new Error("get not implemented"))
    }

    /**
     * Create an annotation.
     *
     * @param {Object|Array<Object>} annosToCreate
     * @param {Options} options
     * @param String options.slug Proposal for the ID to create
     * @param {function} callback
     */
    create(annos, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        cb(new Error("create not implemented"))
    }

    /**
     * Revise an annotation.
     *
     * @param {String} annoId
     * @param {Object} anno
     * @param {Options} options
     * @param {function} callback
     */
    revise(annoId, anno, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        cb(new Error("revise not implemented"))
    }

    /**
     * Delete an annotation, i.e. set the deleted date.
     *
     * @param {String} annoId
     * @param {Options} options
     * @param {function} callback
     */
    delete(annoId, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        return cb(new Error("delete not implemented"))
    }

    /**
     * Search the store.
     *
     * @param {Object} query
     * @param {Options} options
     * @param {function} callback
     */
    search(query, options, cb) {
        if (typeof query   === 'function') [cb, query, options] = [query, {}, {}]
        if (typeof options === 'function') [cb, options] = [options, {}]
        cb(new Error("search not implemented"))
    }



    /*
     * *********************************************************************
     *
     * Protected API
     *
     * *********************************************************************
     */

    _annotationNotFoundError(id) {
        const err = new Error(`Annotation not found in store: ${JSON.stringify(id)}`)
        err.code = 404
        return err
    }

    _revisionNotFoundError(id, rev) {
        const err = new Error(`No revision '${rev}' for annotation '${id}'`)
        err.code = 404
        return err
    }

    _invalidAnnotationError(anno, errors) {
        const err = new Error(`Annotation is invalid: ` + JSON.stringify({anno, errors}, null, 2))
        err.validationErrors = errors
        err.code = 415
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

    _deleteId(anno) {
        delete anno._id
        delete anno.id
        return anno
    }

    _genid(slug='') {
        return slug + slugid.v4()
    }

}

module.exports = {Store, load}
