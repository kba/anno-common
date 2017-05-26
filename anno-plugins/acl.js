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
        // log.silly("Matching against rules:", ctx)
        // try {
        //     log.silly(`Matching against rules:` + JSON.stringify({
        //         'ctx.user': ctx.user,
        //         'ctx.anno': ctx.anno,
        //         'keys(ctx)': Object.keys(ctx)
        //     }, null, 2))
        // } catch (err) {}
        process.env.SIFT_RULE_DEBUG = 'true'
        const matchingRule = this.rules.first(ctx) || FALLBACK_RULE
        // if (config.LOGLEVEL !== '') {
        //     // log.silly(`Rule '${matchingRule}' matched ${JSON.stringify(ctx).substring(0,100)}`)
        //    log.silly(`Rule '${matchingRule}' matched`)
        // }
        this.reason = matchingRule.name
        if (matchingRule.tail)
            return cb(null, matchingRule.name)
        else
            return cb(errors.forbidden(matchingRule.name, ctx))
    }

}

module.exports = AnnoAcl
