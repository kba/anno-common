const usersExample = require('./users-example.json')

class UserMemoryMiddleware {

    constructor() {
        const config = require('@kba/anno-config').loadConfig({
            MW_USER_DATA: JSON.stringify(usersExample)
        })
        const users = JSON.parse(config.MW_USER_DATA)
        Object.keys(users).forEach(id => {
            if (!users[id].id) users[id].id = id
            // TODO aliases
        })
        this.users = users
    }

    process(ctx, cb) {
        if (typeof ctx.user === 'string' && ctx.user in this.users) {
            ctx.user = this.users[ctx.user]
        } else if (typeof ctx.user === 'object' && ctx.user.id in this.users) {
            Object.assign(ctx.user, this.users[ctx.user.id])
        }
        return cb()
    }

}

module.exports = UserMemoryMiddleware
