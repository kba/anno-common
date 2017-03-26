module.exports = ({config}) => {
    return (err, req, resp, next) => {
        if (err && err.code) {
            resp.status(err.code)
            resp.send(err.message) 
        } else if (err) {
            next(err)
        }
        else next()
    }
}
