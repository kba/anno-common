const {RuleSet} = require('sift-rule')

class AnnoAcl {

    process(ctx, cb) {
        ctx.collection = (ctx.collection || 'default')
        const matchingRule = this.rules.first(ctx)
        if (process.env.ANNO_DEBUG == 'true') {
            console.log(`Rule '${matchingRule}' matched ${JSON.stringify(ctx)}`)
        }
        this.reason = matchingRule.name
        if (matchingRule.tail)
            return cb(null, matchingRule.name)
        else
            return cb(matchingRule.name)
    }

}

module.exports = AnnoAcl
