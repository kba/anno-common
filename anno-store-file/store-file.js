const nedb = require('nedb')
const fs = require('fs')
const Store = require('@kba/anno-store-mongolike')
const {envyConf,envyLog} = require('envyconf')

class FileStore extends Store {

    constructor() {
        super()
        const config = envyConf('ANNO', {
            STORE_FILE: `${process.env.HOME}/.local/cache/anno.nedb`,
            COLLECTION: 'default'
        })

        // this.dbfilename = `${config.STORE_FILE}/anno-${config.COLLECTION}.nedb`
        this.dbfilename = config.STORE_FILE
        envyLog('ANNO', 'store-file').debug(`nedb saved as ${this.dbfilename}`)
        this.db = new nedb({filename: this.dbfilename})
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
        fs.unlink(this.dbfilename, err => {
            if (err && err.code !== 'ENOENT')
                return cb(err)
            return this.init(options, cb)
        })
    }

}

module.exports = FileStore
