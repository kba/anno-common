const nedb = require('nedb')
const fs = require('fs')
const Store = require('@kba/anno-store-mongolike')

class MemoryStore extends Store {

    constructor(...args) {
        super(...args)
        this.db = new nedb({})
    }

    _init(options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this.db.loadDatabase(err => {
            if (err) return cb(err)
            return cb()
        })
    }

    _wipe(options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this.db = new nedb({})
        return this.init(options, cb)
    }

}

module.exports = MemoryStore
