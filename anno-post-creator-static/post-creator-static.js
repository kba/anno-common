const UserProcessor = require('@kba/anno-user')
const async = require('async')
const {envyConf} = require('envyconf')

// TODO
module.exports = function() {

    const config = envyConf('ANNO', {
        USER_DATA: JSON.stringify(UserProcessor.usersExample)
    })
    const userProcessor = new UserProcessor(JSON.parse(config.USER_DATA))

    function mapReduceCreators(retvals, cb) {
        const ret = {}
        // Map
        retvals.forEach((val) => {
            if (!Array.isArray(val)) val = [val];
            val.forEach(v => {
                if (v.creator) ret[creator] = null
            })
        })

        // Lookup
        async.each(Object.keys(ret), (user, done) => {
            const ctx = {user}
            userProcessor(ctx, err => {
                if (err) return done(err)
                ret[user] = ctx[user]
                return done()
            })
        },

            // Reduce
            (err) => {
                console.log("XXX", ret)
                if (err) return cb(err)
                retvals.forEach((val) => {
                    if (!Array.isArray(val)) val = [val];
                    val.forEach(v => {
                        if (v.creator && ret[v.creator] && ret[v.creator].public) v.creator = ret[v.creator].public
                    })
                    return cb()
                })
            })
    }

    return function CreatorExpander({ctx, retvals}, cb) {
        if (!retvals)
            return cb()
        mapReduceCreators(retvals, cb)
    }
}
