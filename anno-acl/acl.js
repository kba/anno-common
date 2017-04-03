const {RuleSet} = require('sift-rule')
const {loadConfig,getLogger} = require('@kba/anno-config')
const errors = require('@kba/anno-errors')

class AnnoAcl {

    process(ctx, cb) {
        const config = loadConfig()
        ctx.collection = (ctx.collection || 'default')
        getLogger('acl').silly("Matching against rules:", ctx)
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
