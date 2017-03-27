const tap = require('tap')
const {AnnoACL} = require('.')
process.ANNO_DEBUG = false


tap.test('acl', t => {
    const acl = new AnnoACL()
    function allow(ctx, msg) { return t.notEquals(acl.check(ctx), false, "allow: "+JSON.stringify(ctx)) }
    function forbid(ctx, msg) { return t.equals(acl.check(ctx), false, "forbid: "+JSON.stringify(ctx)) }

    forbid({})
    allow({method:'get'})
    forbid({method:'get', user: 'spambot3000'})
    allow({method:'search'})
    forbid({method:'create'})
    allow({collection:'test-collection'})
    allow({method:'create',collection:'test-collection'})
    allow({method:'create',user:{role:'admin'}})
    allow({method:'revise',user:{id:'john@doe'},anno:{creator:'john@doe'}})
    forbid({method:'revise',user:{id:'nolan'},anno:{creator:'john@doe'}})
    allow({method:'create',user:{perm:[{collection:'default', role:['create']}]}})
    allow({method:'revise',user:'mike'})
    allow({method:'create',user:'john'})
    allow({method:'create',user:{id:'john'}})
    t.end()
})
