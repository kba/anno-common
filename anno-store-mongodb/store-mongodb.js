const Store = require('@kba/anno-store-mongolike')
const {MongoClient} = require('mongodb')

class MongodbStore extends Store {

    constructor() {
        super()
        this.config = require('@kba/anno-config').loadConfig({
            MONGODB_URL: 'mongodb://localhost:27017/anno',
            MONGODB_COLLECTION: 'anno'
        })
    }

    init(cb) {
        MongoClient.connect(this.config.MONGODB_URL, (err, db) => {
            if (err) return cb(err)
            this._mongodb = db
            this.db = db.collection(this.config.MONGODB_COLLECTION)
            return cb(null)
        });
    }

    wipe(cb) {
        this.db.drop(err => {
            if (!err) return this.disconnect(cb)
            if (err.message.match('ns not found'))  return this.disconnect(cb)
            return cb(err)
        })
    }

    disconnect(cb) {
        try {
            this._mongodb.close()
            return cb()
        } catch (err) {
            return cb(err)
        }
    }

}

module.exports = MongodbStore
