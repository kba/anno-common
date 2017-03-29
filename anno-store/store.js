const slugid = require('slugid')
const async = require('async')

function load(loadingModule) {
    const config = require('@kba/anno-config').loadConfig({
        // STORE_MIDDLEWARES: ''
    })
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
    const store = new(impl)()
    try {
        const acl = new(loadingModule.require(config.ACL))()
        store.use(acl.check.bind(acl))
    } catch (err) {
        console.log(err)
        console.error(`Please install '${config.ACL}' configured as ACL`)
        process.exit(1)
    }
    return store
}

class Store {

    constructor(middlewares=[]) {
        this.config = require('@kba/anno-config').loadConfig({
            ACL: '@kba/anno-acl-none'
        })
        this.middlewares = middlewares
        // console.log(this.config)
        // console.error("Store.constructor called")
    }

    _callMethod(ctx, cb) {
        const impl = `_${ctx.method}`
        if (!(impl in this)) {
            return cb(new Error(`${impl} not implemented`))
        }
        async.eachSeries(this.middlewares, (middleware, next) => {
            middleware(ctx, next)
        }, (err, pass) => {
            if (err) return cb(err)
            this[impl](ctx, cb)
        })
    }

    /**
     * Use middleware for auth etc.
     *
     */
    use(middleware) {
        this.middlewares.push(middleware)
    }

    /**
     * Initialize a connection to the store.
     *
     * @param {Options} options
     * @param {String} options.user
     * @param {function} callback
     */
    init(options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        if (!this._init) {
            return cb(new Error("'_init' not implemented"))
        } else {
            this._init(options, cb)
        }
    }

    /**
     * Wipe the store, revisions and all.
     *
     * @param {Options} options
     * @param {String} options.user
     * @param {function} callback
     *
     */
    wipe(options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        if (!this._wipe) {
            return cb(new Error("'_wipe' not implemented"))
        } else {
            this._wipe(options, cb)
        }
    }

    /**
     * Disconnect a store.
     *
     * A disconnected store cannot be used until `init` is called again.
     *
     * @param {Options} options
     * @param {String} options.user
     * @param {function} callback
     */
    disconnect(options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        if (!this._disconnect) {
            return cb(new Error("'_disconnect' not implemented"))
        } else {
            this._disconnect(options, cb)
        }
    }

    /**
     * Retrieve an annotation.
     *
     * @param {String|Array<String>} annoIds
     * @param {Options} options
     * @param {Options} options.latest Return the latest revision
     * @param {String} options.user
     * @param {function} callback
     */
    get(annoIds, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        if (!this._get) {
            return cb(new Error("'_get' not implemented"))
        } else {
            return this._get(annoIds, options, cb)
        }
    }

    /**
     * Create an annotation.
     *
     * @param {Object|Array<Object>} annosToCreate
     * @param {Options} options
     * @param String options.slug Proposal for the ID to create
     * @param {String} options.user
     * @param {function} callback
     */
    create(annos, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        if (!this._create) {
            return cb(new Error("'_create' not implemented"))
        } else {
            this._create(annos, options, cb)
        }
    }

    /**
     * Revise an annotation.
     *
     * @param {String} annoId
     * @param {Object} anno
     * @param {Options} options
     * @param {String} options.user
     * @param {function} callback
     */
    revise(annoId, anno, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        if (!this._revise) {
            return cb(new Error("'_revise' not implemented"))
        } else {
            this._revise(annoId, anno, options, cb)
        }
    }

    /**
     * Delete an annotation, i.e. set the deleted date.
     *
     * @param {String} annoId
     * @param {Options} options
     * @param {String} options.user
     * @param {function} callback
     */
    delete(annoId, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        if (!this._delete) {
            return cb(new Error("'_delete' not implemented"))
        } else {
            this._delete(annoId, options, cb)
        }
    }

    /**
     * Search the store.
     *
     * @param {Object} query
     * @param {Options} options
     * @param {String} options.user
     * @param {function} callback
     */
    search(query, options, cb) {
        if (typeof query   === 'function') [cb, query, options] = [query, {}, {}]
        if (typeof options === 'function') [cb, options] = [options, {}]
        if (!this._search) {
            return cb(new Error("'_search' not implemented"))
        } else {
            this._search(query, options, cb)
        }
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

    _readonlyValueError(id, field) {
        const err = new Error(`Client must not change the '${field}' of annotation '${id}'`)
        err.code = 409
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

    // TODO no idempotency of targets with normalization -> disabled for now
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
        // if (anno.id) {
            // anno.via = anno.id
            delete anno.id
        // }
        return anno
    }

    _genid(slug='') {
        return slug + slugid.v4()
    }

}

const storeTest = require('./store-test')

module.exports = {Store, load, storeTest}
