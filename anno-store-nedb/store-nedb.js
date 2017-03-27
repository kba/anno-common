const nedb = require('nedb')
const fs = require('fs')
const Store = require('@kba/anno-store-mongolike')

class NedbStore extends Store {

    constructor() {
        super()
        this.config = require('@kba/anno-config').loadConfig({
            NEDB_DIR: `${process.env.HOME}/.anno/nedb`,
            COLLECTION: 'default'
        })

        // this.dbfilename = `${config.NEDB_DIR}/anno-${config.COLLECTION}.nedb`
        this.dbfilename = `${this.config.NEDB_DIR}/anno.nedb`
        if (this.config.DEBUG) console.error(`nedb saved as ${this.dbfilename}`)
        this.db = new nedb({filename: this.dbfilename})
    }

    init(options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this.db.loadDatabase(err => {
            if (err) return cb(err)
            return cb()
        })
    }

    _wipe(options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        fs.unlink(this.dbfilename, err => {
            if (err && err.code !== 'ENOENT')
                return cb(err)
            return this.init(cb)
        })
    }

}

module.exports = NedbStore
