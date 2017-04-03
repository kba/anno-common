const expressJWT = require('express-jwt')
const {loadConfig} = require('@kba/anno-config')

module.exports = () => {
    const secret = loadConfig({
        JWT_SECRET: 'S3cr3t!',
    }).JWT_SECRET
    const jwt = expressJWT({secret})
    return (req, resp, next) => {
        jwt(req, resp, (err) => {
            if (err) console.log("JWT Error", err)
            next()
        })
    }
}
