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
    ;['user', 'service'].forEach(option => {
        if (option in req) ret[option] = req[option]
    })
    console.log("Options scraped", ret)
    req.annoOptions = ret
    next()
}
