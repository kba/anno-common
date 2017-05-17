const {envyConf} = require('envyconf')

module.exports = function() {

    const config = envyConf('ANNO', {
        MW_USER_DATA: JSON.stringify({john: {displayName: 'john Doe'}})
    })
    const users = JSON.parse(config.MW_USER_DATA)

    function replaceIfPossible(val) {
        if (val.creator in users) {
            val.creator = users[val.creator]
        }
    }

    return function CreatorExpander({ctx, retvals}, cb) {
        retvals.forEach((val) => {
            if (Array.isArray(val)) {
                val.forEach(replaceIfPossible)
            } else {
                replaceIfPossible(val)
            }
        })
        return cb()
    }
}
