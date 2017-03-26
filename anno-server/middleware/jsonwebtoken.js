const expressJWT = require('express-jwt')

module.exports = (permDB, config) => {
    const jwtMiddleware = expressJWT({secret: config.JWT_SECRET})
    return (perm) => {
        return (req, res, next) => {
            return jwtMiddleware(req, res, () => {
                if (!req.user || req.user.perm !== perm) {
                    return next({
                        status: 401,
                        code: "no_permission",
                        message: `You need the '${perm}' permission to access this resource`
                    })
                }
                return next()
            })
        }
    }
}
