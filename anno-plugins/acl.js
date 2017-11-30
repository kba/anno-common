const {RuleSet} = require('sift-rule')
const {envyConf, envyLog} = require('envyconf')
const errors = require('@kba/anno-errors')

const FALLBACK_RULE = {
    name: 'Fallback Rule',
    tail: false,
}

class AnnoAcl {

    constructor(rules=[]) {
        // TODO validate
        this.rules = new RuleSet(rules)
    }

    process(ctx, cb) {
        const config = envyConf('ANNO')
        const log = envyLog('ANNO', 'acl')
        ctx.collection = (ctx.collection || 'default')
        // process.env.SIFT_RULE_DEBUG = 'true'
        // log.debug("Matching against rules:", ctx)
        // if (ctx.method === 'revise')
        // try {
        //     console.log(`Matching against rules:` + JSON.stringify({
        //         'ctx.method': ctx.method,
        //         'ctx.user': ctx.user,
        //         'ctx.anno': ctx.anno,
        //         'ctx.annoId': ctx.annoId,
        //         'ctx.oldAnno': ctx.oldAnno,
        //         'keys(ctx)': Object.keys(ctx)
        //     }, null, 2))
        // } catch (err) {}
        process.env.SIFT_RULE_DEBUG = 'true'
        // console.log({
        //     rules: this.rules,
        //     user: ctx.user ? ctx.user.id : 'no user',
        //     creator: ctx.anno ? ctx.anno.creator : 'no anno',
        //     creator_id: ctx.anno && ctx.anno.creator ? ctx.anno.creator.id : 'no creator',
        //     method: ctx.method,
        //     anno: ctx.anno,
        // })
        const matchingRule = this.rules.first(ctx) || FALLBACK_RULE
        if (config.LOGLEVEL !== '') {
            // log.silly(`Rule '${matchingRule}' matched ${JSON.stringify(ctx).substring(0,100)}`)
            // const anno = ctx.anno || {}
            // const target = anno.target || '????'
            // log.debug(`Rule '${matchingRule}' matched`, {anno})
           // log.silly(`Rule '${matchingRule}' matched`)
        }
        // if (ctx.user && ctx.method == 'create') {
        //   log.debug(JSON.stringify(Object.keys(ctx)))
        //   log.debug(ctx.anno)
        //   log.debug(matchingRule.name)
        // }
        this.reason = matchingRule.name
        if (matchingRule.tail)
            return cb(null, matchingRule.name)
        else
            return cb(errors.forbidden(matchingRule.name, ctx))
    }

}

module.exports = AnnoAcl
