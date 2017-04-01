const {loadConfig} = require('@kba/anno-config')

module.exports = function () {
    const config = require('@kba/anno-config').loadConfig({
        BASICAUTH_USERNAME: '',
        BASICAUTH_PASSWORD: '',
    })
    return function BasicAuthMiddleware(ctx, cb) {
        if (!config.BASICAUTH_USERNAME)
            return cb(new Error("ANNO_BASICAUTH_USERNAME not set"))
        ctx.auth = ctx.auth || {}
        ;['username', 'password'].forEach(k => {
            ctx.auth[k] = config[`BASICAUTH_${k}`.toUpperCase()]
        })
        cb()
    }
}
