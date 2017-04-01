const axios = require('axios')
const {Store} = require('@kba/anno-store')
const errors = require('@kba/anno-errors')
const querystring = require('querystring')

class HttpStore extends Store {

    constructor() {
        super()
        this.config = require('@kba/anno-config').loadConfig({
            BASE_URL: 'http://localhost:3000/anno'
        })
        this._httpClient = axios.create({
            baseURL: this.config.BASE_URL
        })
    }

    /* @override */
    _init(options, cb) {
        return cb()
    }

    /* @override */
    _create(options, cb) {
        const {annos} = options
        this._httpClient.post('/', annos)
            .then(resp => cb(null, resp.data))
            .catch(err => cb(err.statusCode))
    }

    /* @override */
    _get(options, cb) {
        const {annoId} = options
        const annoUrl = annoId.match('//') ? annoId : `/${annoId}`
        this._httpClient.get(annoUrl)
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
        this._httpClient.get('/' + '?' + querystring.stringify(query))
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
        this._httpClient.put(annoUrl, anno)
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
        this._httpClient.delete(annoUrl)
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
        return this._httpClient.delete('/')
            .then(() => cb())
            .catch(err => {
                return cb(err.statusCode)
            })
    }

    /* @override */
    _disconnect(options, cb) {
        return cb()
    }

}

module.exports = HttpStore
