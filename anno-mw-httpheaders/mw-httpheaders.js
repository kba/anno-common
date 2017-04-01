const {loadConfig} = require('@kba/anno-config')

module.exports = function () {
    const config = loadConfig({ HTTPHEADERS: '' })
    return function HttpHeaderMiddleware(ctx, cb) {
        if (!config.HTTPHEADERS) return cb()
        ctx.httpHeaders = ctx.httpHeaders || {}
        config.HTTPHEADERS.trim()
            .split(/\s*[|\n]+\s*/g)
            .map(kv => kv.trim())
            .map(kv => kv.split(/\s*:\s*/))
            .map(([k, v]) => ctx.httpHeaders[k.trim()] = v.trim())
        cb()
    }
}
