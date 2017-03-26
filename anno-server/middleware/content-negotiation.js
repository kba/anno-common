const jsonldRapper = require('jsonld-rapper')

module.exports = ({config}) => {
    const j2r = new jsonldRapper()
    return (req, resp, next) => {
        if (req.header('Accept').match(/text\/(turtle|n3)/)) {
            j2r.convert(resp.jsonld, 'jsonld', 'turtle', (err, turtle) => {
                if (err) return next(err)
                return resp.send(turtle)
            })
        } else {
            return resp.send(resp.jsonld)
        }
    }
}
