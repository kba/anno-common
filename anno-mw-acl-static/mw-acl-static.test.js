const tap = require('tap')
const AclStatic = require('./mw-acl-static')
const UserStatic = require('@kba/anno-mw-user-static')
process.ANNO_DEBUG = false
const {testAllow, testForbid} = require('../anno-acl/acl-test')

tap.test('acl', t => {
    const userHydrator = new UserStatic()
    const acl = {
        process: (ctx, cb) => {
            userHydrator.process(ctx, () => {
                new AclStatic().process(ctx, cb)
            })
        }
    }

    testForbid(t,acl,{})
    testAllow (t,acl,{method:'get'})
    testForbid(t,acl,{method:'get', user: 'spambot3000'})
    testAllow (t,acl,{method:'search'})
    testForbid(t,acl,{method:'create'})
    testAllow (t,acl,{collection:'test-collection'})
    testAllow (t,acl,{method:'create',collection:'test-collection'})
    testAllow (t,acl,{method:'create',user:{role:'admin'}})
    testAllow (t,acl,{method:'revise',user:{id:'john@doe'},anno:{creator:'john@doe'}})
    testForbid(t,acl,{method:'revise',user:{id:'nolan'},anno:{creator:'john@doe'}})
    testAllow (t,acl,{method:'create',user:{perm:[{collection:'default', role:['create']}]}})
    testAllow (t,acl,{method:'revise',user:'mike'})
    testAllow (t,acl,{method:'create',user:'john'})
    testAllow (t,acl,{method:'create',user:{id:'john'}})
    t.end()
})
