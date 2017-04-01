module.exports = () => {
    return (req, resp, next) => {
        resp.header('Access-Control-Allow-Origin', '*')
        resp.header('Access-Control-Allow-Headers', 'Content-Type, Prefer, Authorization')
        resp.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, DELETE, PUT')
        resp.header('Access-Control-Allow-Origin', '*')
        resp.header('Access-Control-Expose-Headers', 'ETag, Allow, Vary, Link, Content-Type, Location, Content-Location, Prefer')
        return next()
    }
}

