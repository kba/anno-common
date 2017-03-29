function testAllow(t, acl, ctx, msg, cb) {
    acl.process(ctx, (err, pass) => t.ok(pass, "allow: "+JSON.stringify(ctx)))
    if (cb) cb()
}
function testForbid(t, acl, ctx, msg, cb) {
    acl.process(ctx, (err, pass) => t.ok(err, "forbid: "+JSON.stringify(ctx)))
    if (cb) cb()
}

module.exports = {
    testAllow,
    testForbid,
}
