const axios = require('axios')
const Store = require('@kba/anno-store')
const errors = require('@kba/anno-errors')
const querystring = require('querystring')
const {envyConf, envyLog} = require('envyconf')
const {urlJoin, truthy} = require('@kba/anno-util')

envyConf('ANNO', {
    BASE_URL: 'http://localhost:3000',
    BASE_PATH: 'anno',
    HTTP_HEADERS: '{}',
    HTTP_AUTH: '',
})

class HttpStore extends Store {

    constructor(...args) {
        super(...args)
        const axiosOptions = {
            baseURL: urlJoin(this.config.BASE_URL, this.config.BASE_PATH),
            headers: JSON.parse(this.config.HTTP_HEADERS),
        }
        if (this.config.HTTP_BASIC_AUTH) {
            const {username, password} = this.config.HTTP_BASIC_AUTH.split(':').map(x => x.trim())
            axiosOptions.auth = {username, password}
        }
        this._httpClient = axios.create(axiosOptions)
    }

    /* @override */
    _init(options, cb) {
        return cb()
    }

    /* @override */
    _create(options, cb) {
        // console.log(options)
        let {anno} = options
        anno = JSON.parse(JSON.stringify(anno))
        delete anno.hasVersion
        delete anno.versionOf
        delete anno.hasReply
        this._httpClient.post('/', anno, this._axiosConfigFromAnnoOptions(options))
            .then(resp => cb(null, resp.data))
            .catch(axiosErr => {
                const err = new Error(axiosErr.response.data)
                err.code = axiosErr.response.status
                cb(err)
            })
    }

    /* @override */
    _get(options, cb) {
        const {annoId} = options
        const annoUrl = annoId.match('//') ? annoId : `/${annoId}`
        this._httpClient.get(annoUrl, this._axiosConfigFromAnnoOptions(options))
            .then(resp => cb(null, resp.data))
            .catch(err => {
              if (err.response) {
                if (err.response.status === 404) cb(errors.annotationNotFound(annoUrl))
                else if (err.response.status === 410) cb(errors.annotationDeleted(annoUrl))
                else cb(err.response.data)
              } else cb(err)
            })
    }

    /* @override */
    _search(options, cb) {
        const {query} = options
        this._httpClient.get('/' + '?' + querystring.stringify(query), this._axiosConfigFromAnnoOptions(options))
            .then(resp => {
                const col = resp.data
                if (col.total === 0) {
                    return cb(null, [])
                } else {
                    // console.log(col.first.items)
                    cb(null, col.first.items)
                }
            })
            .catch(err => {
                if (err.response) return cb(err.response.data)
                else return cb(err)
            })
    }

    /* @override */
    _revise(options, cb) {
        let {annoId, anno} = options
        const annoUrl = annoId.match('//') ? annoId : `/${annoId}`
        anno = JSON.parse(JSON.stringify(anno))
        // delete anno.via
        // delete anno.replyTo
        this._httpClient.put(annoUrl, anno, this._axiosConfigFromAnnoOptions(options))
            .then(resp => cb(null, resp.data))
            .catch(err => {
                if (err.response) return (err.response.status === 404)
                    ? cb(errors.annotationNotFound(annoUrl))
                    : cb(err.response.data)
                else return cb(err)
            })
    }

    /* @override */
    _delete(options, cb) {
        const {annoId} = options
        const annoUrl = annoId.match('//') ? annoId : `/${annoId}`
        this._httpClient.delete(annoUrl, this._axiosConfigFromAnnoOptions(options))
            .then(() => cb())
            .catch(err => {
                if (err.response) return (err.response.status === 404)
                    ? cb(errors.annotationNotFound(annoUrl))
                    : cb(err.response.data)
                else return cb(err)
            })
    }

    /* @override */
    _wipe(options, cb) {
        return this._httpClient.delete('/', this._axiosConfigFromAnnoOptions(options))
            .then(() => cb())
            .catch(err => {
                if (err.response) return cb(err.response.data)
                else return cb(err)
            })
    }

    /* @override */
    _disconnect(options, cb) {
        return cb()
    }

    _aclCheck(options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        const {targets} = options
        return this._httpClient.post('/acl', {targets}, this._axiosConfigFromAnnoOptions(options))
            .then((resp) => cb(null, resp.data))
            .catch(err => {
                if (err.response) return cb(err.response.data)
                else return cb(err)
            })
    }

    _mintDoi(options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        const {anno} = options
        const annoIds = [anno.id]
        return this._httpClient.post('/doi', {annoIds}, this._axiosConfigFromAnnoOptions(options))
            .then(resp => cb(null, resp.data))
            .catch(err => {
                if (err.response) return cb(err.response.data)
                else return cb(err)
            })
    }

    // ----------------------------------------
    // PRIVATE
    // ----------------------------------------
    _axiosConfigFromAnnoOptions(options) {
        const ret = {}

        // TODO
        // BasicAuth
        if (options.auth && options.auth.username) {
            ret.auth = ret.auth || {}
            ret.auth.username = options.auth.username
            ret.auth.password = options.auth.password
        }

        // Custom Headers
        ret.headers = ret.headers || {}
        if (options.httpHeaders) {
            Object.assign(ret.headers, options.httpHeaders)
        }

        ;[
            'skipVersions',
            'skipReplies',
            'metadataOnly',
            'includeDeleted',
            'forceDelete'
        ].forEach(option => {
            if (option in options) {
                ret.headers[`X-Anno-${option}`] = truthy(options[option])
            }
        })

        const log = envyLog('ANNO', 'store-http')
        log.silly("axios config from options", ret)

        return ret
    }

}

module.exports = HttpStore
