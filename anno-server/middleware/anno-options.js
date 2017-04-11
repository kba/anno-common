module.exports = () => optionsFromRequest

function optionsFromRequest(req, resp, next) {
    const ret = {}
    ;['skipVersions', 'skipReplies', 'metadataOnly'].forEach(option => {
        if (option in req.query) {
            ret[option] = !! req.query[option].match(/^(true|1)$/)
            delete req.query[option]
        }
    })
    ;['user'].forEach(option => {
        if (option in req) ret[option] = req[option]
    })
    console.log("Options scraped", ret)
    req.annoOptions = ret
    next()
}
