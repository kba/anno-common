const axios = require('axios')
const {Store} = require('@kba/anno-store')
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
    create(annosToCreate, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this._httpClient.post('/', annosToCreate)
            .then(resp => cb(null, resp.data))
            .catch(err => cb(err))
    }

    /* @override */
    get(annoId, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        const annoUrl = annoId.match('//') ? annoId : `/${annoId}`
        this._httpClient.get(annoUrl)
            .then(resp => cb(null, resp.data))
            .catch(err => {
                if(err.response.status === 404) {
                    return cb(this._annotationNotFoundError(annoUrl))
                }
                return cb(err.response.data)
            })
    }

    /* @override */
    search(query, options, cb) {
        if (typeof query   === 'function') [cb, query, options] = [query, {}, {}]
        if (typeof options === 'function') [cb, options] = [options, {}]
        this._httpClient.get('/' + '?' + querystring.stringify(query))
            .then(resp => cb(null, resp.data))
            .catch(cb)
    }

    /* @override */
    revise(annoId, anno, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        const annoUrl = annoId.match('//') ? annoId : `/${annoId}`
        this._httpClient.put(annoUrl, anno)
            .then(resp => cb(null, resp.data))
            .catch(err => {
                if(err.response.status === 404) {
                    return cb(this._annotationNotFoundError(annoUrl))
                }
                return cb(err.response.data)
            })
    }

    /* @override */
    delete(annoId, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        const annoUrl = annoId.match('//') ? annoId : `/${annoId}`
        this._httpClient.delete(annoUrl)
            .then(() => cb())
            .catch(err => {
                if(err.response.status === 404) {
                    return cb(this._annotationNotFoundError(annoUrl))
                }
                return cb(err.response.data)
            })
    }

    /* @override */
    wipe(cb) {
        return this._httpClient.delete('/')
            .then(() => cb())
            .catch(cb)
    }

}

module.exports = HttpStore
