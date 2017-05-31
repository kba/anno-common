const Store = require('@kba/anno-store-mongolike')
const {envyConf} = require('envyconf')
const {MongoClient} = require('mongodb')

class MongodbStore extends Store {

    constructor() {
        super()
        this.config = envyConf('ANNO', {
            MONGODB_PORT: '27017',
            MONGODB_HOST: 'localhost',
            MONGODB_DB: 'anno',
            MONGODB_COLLECTION: 'anno',
        })
    }

    _init(options, cb) {
        const {MONGODB_HOST, MONGODB_PORT, MONGODB_DB, MONGODB_COLLECTION} = this.config
        MongoClient.connect(`mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DB}`, (err, db) => {
            if (err) return cb(err)
            this._mongodb = db
            this.db = db.collection(this.config.MONGODB_COLLECTION)
            return cb(null)
        });
    }

    _wipe(options, cb) {
        this.db.drop(err => {
            if (!err) return this.disconnect(cb)
            if (err.message.match('ns not found'))  return this.disconnect(cb)
            return cb(err)
            // if (err) {
            //     // if (err.message.match('ns not found'))  return this.disconnect(cb)
            //     return cb(err)
            // }
            // this._disconnect({}, err => this._init({}, cb))
            // // return cb(err)
        })
    }

    _disconnect(options, cb) {
        try {
            this._mongodb.close()
            return cb()
        } catch (err) {
            return cb(err)
        }
    }

}

module.exports = MongodbStore
