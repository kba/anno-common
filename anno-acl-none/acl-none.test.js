const tap = require('tap')
const acl = new(require('.'))()

tap.test('acl-none', t => {
    function allow(ctx, msg) { acl.check(ctx, (err, pass) => t.ok(pass, "allow: "+JSON.stringify(ctx))) }
    function forbid(ctx, msg) { acl.check(ctx, (err, pass) => t.ok(err, "forbid: "+JSON.stringify(ctx))) }

    allow({})
    allow({method:'get'})
    allow({method:'get', user: 'spambot3000'})
    allow({method:'search'})
    allow({method:'create'})
    allow({collection:'test-collection'})
    allow({method:'create',collection:'test-collection'})
    allow({method:'create',user:{role:'admin'}})
    allow({method:'revise',user:{id:'john@doe'},anno:{creator:'john@doe'}})
    allow({method:'revise',user:{id:'nolan'},anno:{creator:'john@doe'}})
    allow({method:'create',user:{perm:[{collection:'default', role:['create']}]}})
    allow({method:'revise',user:'mike'})
    allow({method:'create',user:'john'})
    allow({method:'create',user:{id:'john'}})
    t.end()
})
