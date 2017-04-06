const axios = require('axios')
const Store = require('@kba/anno-store')
const errors = require('@kba/anno-errors')
const querystring = require('querystring')
const {loadConfig, getLogger} = require('@kba/anno-config')

class HttpStore extends Store {

    constructor(...args) {
        super(...args)
        this.config = loadConfig({
            BASE_URL: 'http://localhost:3000/anno'
        })
        const options = {
            baseURL: this.config.BASE_URL
        }
        this._httpClient = axios.create(options)
    }

    /* @override */
    _init(options, cb) {
        return cb()
    }

    /* @override */
    _create(options, cb) {
        const {anno} = options
        this._httpClient.post('/', anno, this._configFromOptions(options))
            .then(resp => cb(null, resp.data))
            .catch(err => cb(err.statusCode))
    }

    /* @override */
    _get(options, cb) {
        const {annoId} = options
        const annoUrl = annoId.match('//') ? annoId : `/${annoId}`
        this._httpClient.get(annoUrl, this._configFromOptions(options))
            .then(resp => cb(null, resp.data))
            .catch(err => {
                if(err.response.status === 404) {
                    return cb(errors.annotationNotFound(annoUrl))
                }
                return cb(err.response.data)
            })
    }

    /* @override */
    _search(options, cb) {
        const {query} = options
        this._httpClient.get('/' + '?' + querystring.stringify(query), this._configFromOptions(options))
            .then(resp => {
                const col = resp.data
                if (col.total === 0) {
                    return []
                } else {
                    cb(null, col.first.items)
                }
            })
            .catch(err => cb(err.statusCode))
    }

    /* @override */
    _revise(options, cb) {
        const {annoId, anno} = options
        const annoUrl = annoId.match('//') ? annoId : `/${annoId}`
        this._httpClient.put(annoUrl, anno, this._configFromOptions(options))
            .then(resp => cb(null, resp.data))
            .catch(err => {
                if(err.response.status === 404) {
                    return cb(errors.annotationNotFound(annoUrl))
                }
                return cb(err.response.data)
            })
    }

    /* @override */
    _delete(options, cb) {
        const {annoId} = options
        const annoUrl = annoId.match('//') ? annoId : `/${annoId}`
        this._httpClient.delete(annoUrl, this._configFromOptions(options))
            .then(() => cb())
            .catch(err => {
                if(err.response.status === 404) {
                    return cb(errors.annotationNotFound(annoUrl))
                }
                return cb(err.response.data)
            })
    }

    /* @override */
    _wipe(options, cb) {
        return this._httpClient.delete('/', this._configFromOptions(options))
            .then(() => cb())
            .catch(err => {
                return cb(err.statusCode)
            })
    }

    /* @override */
    _disconnect(options, cb) {
        return cb()
    }

    // ----------------------------------------
    // PRIVATE
    // ----------------------------------------
    _configFromOptions(options) {
        const ret = {}
        // BasicAuth
        if (options.auth && options.auth.username) {
            ret.auth = ret.auth || {}
            ret.auth.username = options.auth.username
            ret.auth.password = options.auth.password
        }
        // Custom Headers
        if (options.httpHeaders) {
            ret.headers = ret.headers || {}
            Object.assign(ret.headers, options.httpHeaders)
        }
        const log = getLogger('store-http')
        log.silly("axios config from options", ret)
        return ret
    }

}

module.exports = HttpStore
