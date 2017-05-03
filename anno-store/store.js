const slugid = require('slugid')
const async = require('async')
const {envyConf, envyLog} = require('envyconf')

class Store {

    static load(loadingModule) {
        const config = envyConf('ANNO', {
            BASE_URL: 'http://ANNO_BASE_URL-NOT-SET',
            BASE_PATH: '',
            STORE_MIDDLEWARES: ''
        })
        const log = envyLog('ANNO', 'store')
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
        const middlewareModules = config.STORE_MIDDLEWARES
            .split(',')
            .map(s => s.trim())
            .filter(s => s !== '')
        log.silly('middlewares', middlewareModules)
        async.eachSeries(middlewareModules, (middlewareModule, next) => {
            var middlewareImpl;
            try {
                log.silly(`Loading ${middlewareModule}`)
                middlewareImpl = loadingModule.require(middlewareModule)
            } catch (err) {
                console.log(err)
                console.error(`Please install '${middlewareModule}' configured as middleware`)
                process.exit(1)
            }
            store.use(middlewareImpl())
            next()
        })
        return store
    }

    constructor(config={}) {
        // Override env config with config passed explicitly to constructor
        this.config = Object.assign(envyConf('ANNO', {}), config)
        this.middlewares = []
        // console.log(this.config)
        // console.error("Store.constructor called", config)
    }

    _callMethod(ctx, cb) {
        const impl = `_${ctx.method}`
        if (!(impl in this)) {
            return cb(new Error(`${impl} not implemented`))
        }
        const log = envyLog('ANNO', 'store')
        log.silly(`Calling method '${ctx.method}'`, ctx)
        async.eachSeries(this.middlewares, (middleware, next) => {
            middleware(ctx, function process(...args) {
                log.silly(`ctx after ${middleware.constructor.name}`, ctx)
                next(...args)
            })
        }, (err, pass) => {
            log.silly('finished all middlewares')
            if (err) return cb(err)
            if (ctx.dryRun) {
                return cb(null, ctx)
            } else {
                this[impl](ctx, cb)
            }
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
        this._callMethod(Object.assign(options, {
            method: 'init'
        }), cb)
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
        this._callMethod(Object.assign(options, {
            method: 'wipe'
        }), cb)
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
        this._callMethod(Object.assign(options, {
            method: 'disconnect'
        }), cb)
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
    get(annoId, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this._callMethod(Object.assign(options, {
            method: 'get',
            annoId,
        }), cb)
    }

    /**
     * Create an annotation.
     *
     * @param {Object} anno
     * @param {Options} options
     * @param String options.slug Proposal for the ID to create
     * @param {String} options.user
     * @param {function} callback
     */
    create(anno, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this._callMethod(Object.assign(options, {
            method: 'create',
            anno,
        }), cb)
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
        this._callMethod(Object.assign(options, {
            method: 'revise',
            annoId,
            anno,
        }), cb)
    }

    /**
     * Delete an annotation, i.e. set the deleted date.
     *
     * @param {String} annoId
     * @param {Options} options
     * @param {Boolean} options.forceDelete Set to `true` to hint the store to
     *                                      actually delete, not just mark deleted
     * @param {String} options.user
     * @param {function} callback
     */
    delete(annoId, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this._callMethod(Object.assign(options, {
            method: 'delete',
            annoId,
        }), cb)
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
        this._callMethod(Object.assign(options, {
            method: 'search',
            query,
        }), cb)
    }

    /**
     * Reply to an annotation
     */
    reply(annoId, anno, options, cb) {
        const log = envyLog('ANNO', 'store')
        console.log(annoId, anno)
        log.debug(`Replying to ${annoId}`, anno)
        if (typeof options === 'function') [cb, options] = [options, {}]
        this._callMethod(Object.assign(options, {
            method: 'reply',
            annoId,
            anno,
        }), cb)
    }

    /* @override */
    _reply(options, cb) {
        const {anno, annoId} = options
        // TODO take fragment identifier from target URL if any
        // TODO handle selectors in pre-existing target
        const log = envyLog('ANNO', 'store')
        anno.replyTo = annoId.match(/\/\//) 
            ? annoId
            : this._urlFromId(annoId)
        log.debug(`Replying to ${annoId}`, anno)
        this.create(anno, cb)
    }

    aclCheck(targets, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this._callMethod(Object.assign(options, {
            method: 'aclCheck',
            targets,
        }), cb)
    }

    _aclCheck(options, cb) {
        const ret = {}
        options.dryRun = true
        const {targets} = options
        async.forEach(targets, (url, urlDone) => {
            ret[url] = {}
            const anno = {target: url}
            async.parallel({
                read:   (cb) => this.get(url, options, (err)          => cb(null, !err)),
                create: (cb) => this.create(anno, options, (err)      => cb(null, !err)),
                revise: (cb) => this.revise(url, anno, options, (err) => cb(null, !err)),
                remove: (cb) => this.delete(url, options, (err)       => cb(null, !err)),
            }, (err, perms) => {
                ret[url] = perms
                urlDone()
            })
        }, (err) => cb(err, ret))
    }


    /*
     * *********************************************************************
     *
     * Protected API
     *
     * *********************************************************************
     */

    _idFromURL(url) {
        return url.replace(`${this.config.BASE_URL}${this.config.BASE_PATH}/anno/`, '')
    }

    _urlFromId(annoId) {
        return `${this.config.BASE_URL}${this.config.BASE_PATH}/anno/${annoId}`
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
        // delete anno._id
        if (anno.id) {
            anno.via = anno.id
            delete anno.id
        }
        return anno
    }

    _genid(slug='') {
        return slug + slugid.nice()
    }

}

Store.prototype.remove = Store.prototype.delete
Store.prototype.comment = Store.prototype.reply

module.exports = Store
