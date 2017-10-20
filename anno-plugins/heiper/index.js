const {envyLog} = require('envyconf')
// const errors = require('@kba/anno-errors')

class AnnoDOI {

    constructor(collections) {
        this.log = envyLog('ANNO', 'plugin/doi')
    }

    process(ctx, cb) {
      if (!ctx || ctx.method !== 'mintDoi')
        return cb()

      console.log("DOING SHIT")

      // if ('retvals' in ctx) {
      //   const fn = (anno) => {
      //     const user = this._lookupUser(anno.creator, ctx)
      //     if (user && user.public) anno.creator = Object.assign(user.public, {id: user.id})
      //   }
      //   if (ctx.method === 'search') {
      //     for (let anno of ctx.retvals[0]) {
      //       applyToAnno(anno, fn)
      //     }
      //   } else if (ctx.method === 'get') {
      //     applyToAnno(ctx.retvals[0], fn)
      //   }
      //   // pre-processing
      // } else if (ctx.anno && ! ctx.metadataOnly && ! ctx.anno.creator && ctx.user && ctx.user.id) {
      //   ctx.anno.creator = ctx.user.id
      // }
      return cb()
    }

}

module.exports = AnnoDOI



