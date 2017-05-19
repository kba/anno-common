module.exports = () => optionsFromRequest

function optionsFromRequest(req, resp, next) {
    const ret = {}

    // boolean
    ;['skipVersions', 'skipReplies', 'metadataOnly'].forEach(option => {
        if (option in req.query) {
            ret[option] = !! req.query[option].match(/^(true|1)$/)
            delete req.query[option]
        }
    })

    // collection
    ;['collection'].forEach(option => {
        if (option in req.query) {
            ret[option] = req.query[option]
            delete req.query[option]
        }
    })


    // context metadata
    const metadata = {}
    for (let option in req.query) {
        if (option.indexOf('metadata.') === 0) {
            metadata[option.replace('metadata.', '')] = req.query[option]
            delete req.query[option]
        }
    }
    if (Object.keys(metadata).length)
        ret.metadata = metadata

    // Header
    ;['slug'].forEach(hdrName => {
        if (req.header(hdrName)) ret[hdrName] = req.header(hdrName)
    })

    // user set from jwt
    ;['user'].forEach(option => {
        if (option in req) ret[option] = req[option]
    })
    console.log("Options scraped", ret)
    req.annoOptions = ret
    next()
}
