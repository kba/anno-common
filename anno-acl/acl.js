const {RuleSet} = require('sift-rule')
const {envyConf, envyLog} = require('envyconf')
const errors = require('@kba/anno-errors')

class AnnoAcl {

    constructor(rules) {
        // TODO validate
        this.rules = new RuleSet(rules)
    }

    process(ctx, cb) {
        const config = envyConf('ANNO')
        const log = envyLog('ANNO', 'acl')
        ctx.collection = (ctx.collection || 'default')
        log.silly("Matching against rules:", ctx)
        const matchingRule = this.rules.first(ctx)
        if (config.LOGLEVEL !== '') {
            console.log(`Rule '${matchingRule}' matched ${JSON.stringify(ctx)}`)
        }
        this.reason = matchingRule.name
        if (matchingRule.tail)
            return cb(null, matchingRule.name)
        else
            return cb(errors.forbidden(matchingRule.name, ctx))
    }

}

module.exports = AnnoAcl
