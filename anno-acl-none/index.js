class AnnoAclNone {

    constructor() {}

    check(ctx, cb) { return cb(null, "All shall pass") }

}

module.exports = AnnoAclNone
