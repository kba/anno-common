const axios = require('axios')
const {Store} = require('@kba/anno-store')

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
        const getUrl = annoId.match('//') ? annoId : `/${annoId}`
        this._httpClient.get(getUrl)
            .then(resp => cb(null, resp.data))
            .catch(err => cb(err))
    }

    /* @override */
    wipe(cb) {
        this._httpClient.delete('/')
            .then(resp => cb(null, resp))
            .catch(err => cb(err))
    }

}

module.exports = HttpStore
