module.exports = () => {
    return (err, req, resp, next) => {
        if (err && err.code && err.code < 600) {
            resp.status(err.code)
            resp.send(err.message) 
        } else if (err) {
            next(err)
        }
        else next()
    }
}
