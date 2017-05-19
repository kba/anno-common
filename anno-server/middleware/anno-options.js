module.exports = () => optionsFromRequest

function optionsFromRequest(req, resp, next) {
    const ret = {}

    // boolean values
    ;['skipVersions', 'skipReplies', 'metadataOnly'].forEach(option => {
        if (option in req.query) {
            ret[option] = !! req.query[option].match(/^(true|1)$/)
            delete req.query[option]
        }
    })

    // Header
    ;['slug'].forEach(hdrName => {
        if (req.header(hdrName)) ret[hdrName] = req.header(hdrName)
    })

    // user set from jwt
    if ('user' in req) {
        if ('id' in req.user) ret.user = req.user.id
        if ('service' in req.user) ret.service = req.user.service
    }
    console.log("Options scraped", ret)
    req.annoOptions = ret
    next()
}
