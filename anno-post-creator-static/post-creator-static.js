const {UserProcessor} = require('@kba/anno-rights')
const async = require('async')
const {envyConf} = require('envyconf')

// TODO
module.exports = function() {

    const config = envyConf('ANNO').USER_DATA || '[]'
    const userProcessor = new UserProcessor(JSON.parse(config))

    return function CreatorExpander({ctx, retvals}, cb) {
        if (!retvals) return cb()
        userProcessor.mapReduceCreators(retvals, cb)
    }
}
