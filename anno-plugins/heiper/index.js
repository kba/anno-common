const {envyLog} = require('envyconf')
const {fetch} = require('fetch-ponyfill')()
// const errors = require('@kba/anno-errors')

class AnnoDOI {

    constructor(collections) {
        this.log = envyLog('ANNO', 'plugin/doi')
    }

    process(ctx, cb) {
      if (ctx.method !== 'mintDoi')
        return cb()

      const {retvals, collectionConfig} = ctx
      if (!collectionConfig.heiperEndpoint) {
        return cb(new Error("Collection must set 'heiperEndpoint'"))
      }
      Promise.all(retvals.map(heiperJson => fetch(collectionConfig.heiperEndpoint, {
        method: 'POST',
        body: JSON.stringify(heiperJson),
      })))
        .then(() => {
          // XXX TODO how to get store?
          return cb()
        })
        .catch(err => {
          return cb(err)
        })
    }

}

module.exports = AnnoDOI
