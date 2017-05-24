const slugid = require('slugid')
const async = require('async')
const {envyConf, envyLog} = require('envyconf')

class Store {
    /**
     * ## Public API
     */


    /**
     * ### <code><strong>static</strong> load(loadingModule)</code>
     *
     * Modules may call this static method to instantiate a store from the
     * environment and using the packages installed in the calling package.
     *
     * ```js
     * // my-package/index.js
     * const store = require('@kba/anno-store').load(module)
     * store.init(...)
     * ```
     *
     */

    static load(loadingModule) {
        const config = envyConf('ANNO', {
            BASE_URL: 'http://ANNO_BASE_URL-NOT-SET',
            BASE_PATH: '',
            METADATA: '{}',
            STORE_HOOKS_PRE: '',
            STORE_HOOKS_POST: '',
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
        async.eachSeries(['pre', 'post'], (hookName, nextHook) => {
            const modNames = config[`STORE_HOOKS_${hookName.toUpperCase()}`]
                .split(',')
                .map(s => s.trim())
                .filter(s => s !== '')
            log.silly(`${hookName} hook: `, modNames)
            async.eachSeries(modNames, (modNameRaw, next) => {
                const [modName, modImport] = modNameRaw.split(':')
                var mod;
                try {
                    log.silly(`Loading module ${modName}`)
                    mod = loadingModule.require(modName)
                } catch (err) {
                    console.log(err)
                    console.error(`Please install '${modName}' configured as ${hookName} processor`)
                    process.exit(1)
                }
                if (modImport) {
                    store.use(mod[modImport](), hookName)
                } else {
                    store.use(mod(), hookName)
                }
                next()
            }, nextHook)
        })
        return store
    }

    constructor(config={}) {
        // Override env config with config passed explicitly to constructor
        this.log = envyLog('ANNO', 'store')
        this.config = Object.assign(envyConf('ANNO', {}), config)
        this.hooks = {
            pre: [],
            post: [],
        }
        // console.log(this.config)
        // console.error("Store.constructor called", config)
    }

    __logContext(msg, ctx) {
        if (ctx.dryRun) return
        // XXX this is just to keep logs small
        const ctxCopy = Object.assign({}, ctx)
        ;['anno', 'targets'].forEach(k => ctxCopy[k] = '[...]')
        this.log.silly(`${msg}: ${JSON.stringify(ctxCopy)}`)
    }

    _callMethod(ctx, cb) {
        const impl = `_${ctx.method}`
        // Object.assign(ctx, this.config.METADATA)
        if (!(impl in this)) {
            return cb(new Error(`${impl} not implemented`))
        }
        this.__logContext(`BEFORE Method: ${ctx.method}`, ctx)
        async.eachSeries(this.hooks.pre, (proc, next) => {
            proc(ctx, (...args) => {
                this.__logContext(`After preproc ${proc.impl}`, ctx)
                next(...args)
            })
        }, (err, pass) => {
            if (err)
                this.log.silly(`${ctx.user.id ? ctx.user.id : ctx.user} may not ${ctx.method}: ${err}`)
            if (err) return cb(err)
            if (ctx.dryRun)
                return cb(null, ctx)
            this.__logContext(`NOW Method: ${ctx.method}`, ctx)
            this[impl](ctx, (err, ...retvals) => {
                if (err) return cb(err)
                async.eachSeries(this.hooks.post, (proc, next) => {
                    this.log.silly(`Running postproc ${proc.impl}`)
                    proc({ctx, retvals}, (...args) => {
                        this.__logContext(proc.name, ctx)
                        next(...args)
                    })
                }, (err) => {
                    if (err) return cb(err)
                    return cb(null, ...retvals)
                })
            })
        })
    }

    /**
     * ### `use(proc, hook='pre')`
     *
     * Use processor before (`hook=pre`) or after (`hook=post`) store method.
     *
     */
    use(middleware, hook='pre') {
        this.hooks[hook].push(middleware)
    }

    /**
     * ### `init(options, cb)`
     *
     * Initialize a connection to the store.
     *
     * - `@param {Options} options`
     * - `@param {String} options.user`
     * - `@param {function} callback`
     */
    init(options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this._callMethod(Object.assign(options, {
            method: 'init'
        }), cb)
    }

    /**
     * ### `wipe(options, callback)`
     *
     * Wipe the store, revisions and all.
     *
     * - `@param {Options} options`
     * - `@param {String} options.user`
     * - `@param {function} callback`
     *
     */
    wipe(options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this._callMethod(Object.assign(options, {
            method: 'wipe'
        }), cb)
    }

    /**
     * ### `disconnect(options, callback)`
     * Disconnect a store.
     *
     * A disconnected store cannot be used until `init` is called again.
     *
     * - `@param {Options} options`
     * - `@param {String} options.user`
     * - `@param {function} callback`
     */
    disconnect(options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this._callMethod(Object.assign(options, {
            method: 'disconnect'
        }), cb)
    }

    /**
     * ### `get(annoId, options, cb)`
     *
     * Retrieve an annotation.
     *
     * - `@param {String|Array<String>} annoIds`
     * - `@param {Object} options`
     *     - `@param {Boolean} options.latest` Return the latest revision only
     *     - `@param {Boolean} options.metadataOnly` Return only metadata
     *     - `@param {Boolean} options.skipVersions` Omit versions
     *     - `@param {Boolean} options.skipReplies` Omit replies
     * - `@param {String} options.user`
     * - `@param {function} callback`
     */
    get(annoId, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this._callMethod(Object.assign(options, {
            method: 'get',
            annoId,
        }), cb)
    }

    /**
     * ### `create(anno, options, callback)`
     *
     * Create an annotation.
     *
     * - `@param {Object} anno`
     * - `@param {Options} options`
     * - `@param String options.slug Proposal for the ID to create`
     * - `@param {String} options.user`
     * - `@param {function} callback`
     */
    create(anno, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this._callMethod(Object.assign(options, {
            method: 'create',
            anno,
        }), cb)
    }

    /**
     * ### `revise(annoId, anno, options, callback)`
     *
     * Revise an annotation.
     *
     * - `@param {String} annoId`
     * - `@param {Object} anno`
     * - `@param {Options} options`
     *   - `@param {String} options.user`
     * - `@param {function} callback`
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
     * ### `delete(annoId, options, callback)`
     * ### `remove(annoId, options, callback)`
     *
     * Delete an annotation, i.e. set the deleted date.
     *
     * - `@param {String} annoId`
     * - `@param {Options} options`
     * - `@param {Boolean} options.forceDelete` Set to `true` to hint the store to
     *                                      actually delete, not just mark deleted
     * - `@param {String} options.user`
     * - `@param {function} callback`
     */
    delete(annoId, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this._callMethod(Object.assign(options, {
            method: 'delete',
            annoId,
        }), cb)
    }

    /**
     * ### `search(query, options, callback)`
     *
     * Search the store.
     *
     * - `@param {Object} query`
     * - `@param {Options} options`
     * - `@param {String} options.user`
     * - `@param {function} callback`
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
     * ### `reply(annoId, anno, options, callback)`
     * ### `comment(annoId, anno, options, callback)`
     *
     * Reply to an annotation
     *
     * - `@param {String} annoId`
     * - `@param {Object} anno`
     * - `@param {Options} options`
     * - `@param {String} options.user`
     * - `@param {function} callback`
     */
    reply(annoId, anno, options, cb) {
        console.log(annoId, anno)
        this.log.debug(`Replying to ${annoId}`, anno)
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
        anno.replyTo = annoId.match(/\/\//) 
            ? annoId
            : this._urlFromId(annoId)
        this.log.debug(`Replying to ${annoId}`, anno)
        this.create(anno, cb)
    }

    /**
     * ### `aclcheck(targets, options, callback)`
     *
     * - `@param {Array} targets`
     * - `@param {Options} options`
     * - `@param {function} callback`
     *
     */
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

    /**
     * ### `import(anno, options, callback)`
     *
     * Replaces the complete annotation with the passed annotation, not just revise it.
     *
     * - `@param {Object} anno`
     * - `@param {Options} options`
     *   - `@param String options.slug Proposal for the ID to create`
     *   - `@param {String} options.user`
     * - `@param {function} callback`
     *
     */
    import(anno, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this._callMethod(Object.assign(options, {
            method: 'import',
            anno,
        }), cb)
    }


    /**
     * ## Protected API
     *
     * These methods are available for store implementations but should not be
     * used by consumers.
     */

    /**
     * ### `_idFromURL(url)`
     *
     * Get only the slug part of a URL
     */
    _idFromURL(url) {
        return url.replace(`${this.config.BASE_URL}${this.config.BASE_PATH}/anno/`, '')
    }

    /**
     * ### `_urlFromId(annoId)`
     *
     * Generate a full URL to an annotation by its id.
     */
    _urlFromId(annoId) {
        return `${this.config.BASE_URL}${this.config.BASE_PATH}/anno/${annoId}`
    }

    /**
     * ### `_normalizeTarget(annoDoc)`
     *  TODO no idempotency of targets with normalization -> disabled for now
     */
    _normalizeTarget(annoDoc) {
        if (!Array.isArray(annoDoc.target)) annoDoc.target = [annoDoc.target]
        annoDoc.target = annoDoc.target.map(target =>
            (typeof target === 'string') ? {source: target} : target)
        if (annoDoc.target.length === 1) annoDoc.target = annoDoc.target[0]
        return annoDoc
    }

    /**
     * ### `_normalizeType(anno)`
     *
     * Make sure `anno.type` exists, is an Array and contains `Annotation`
     */
    _normalizeType(annoDoc) {
        if (!('type' in annoDoc)) annoDoc.type = []
        if (!Array.isArray(annoDoc.type)) annoDoc.type = [annoDoc.type]
        if (annoDoc.type.indexOf('Annotation') === -1) annoDoc.type.push('Annotation')
        return annoDoc
    }

    /**
     * ### `deleteId(anno)`
     *
     * Delete the `id` and store it in `via`.
     *
     * - `@param Object anno`
     */
    _deleteId(anno) {
        // delete anno._id
        if (anno.id) {
            anno.via = anno.id
            delete anno.id
        }
        return anno
    }

    /**
     * ### `_genid(slug='')`
     *
     * Generate an ID for the annotation from `slug` and a ["nice"
     * slugid](https://www.npmjs.com/package/slugid)
     */
    _genid(slug='') {
        return slug + slugid.nice()
    }

}

Store.prototype.remove = Store.prototype.delete
Store.prototype.comment = Store.prototype.reply

module.exports = Store
