const {RuleSet} = require('sift-rule')
const {envyConf, envyLog} = require('envyconf')
const errors = require('@kba/anno-errors')

const schema = {
    type: 'object',
    properties: {
        secret: {
            type: 'string'
        }
    }
}

class AnnoCollection {

    constructor(collections) {
        console.log("Instantiating CollectionProcessor with", collections)
        // TODO validate
        this.collections = collections
    }

    process(ctx, cb) {
        const config = envyConf('ANNO')
        const log = envyLog('ANNO', 'collection')
        ctx.collection = (ctx.collection || 'default')
        ctx.collectionConfig = {}
        if (!(ctx.collection in this.collections)) {
            return cb(new Error(`Undefined collection ${ctx.collection}`))
        }
        Object.assign(ctx.collectionConfig, this.collections[ctx.collection])
        console.log(ctx.collectionConfig)
        if (!ctx.collectionConfig.secret) {
            console.log(errors.badRequest(`No 'secret' for collection: ${ctx.collection}`))
            return cb(errors.badRequest(`No 'secret' for collection: ${ctx.collection}`))
        }
        return cb()
    }

}

module.exports = AnnoCollection

