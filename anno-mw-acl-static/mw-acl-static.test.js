const tap = require('tap')
const AclStatic = require('./mw-acl-static')
const UserStatic = require('@kba/anno-mw-user-static')
process.ANNO_DEBUG = false
const {testAllow, testForbid} = require('../anno-acl/acl-test')

tap.test('acl', t => {
    const acl = AclStatic()
    const userHydrator = UserStatic()
    const pipeline = (ctx, cb) => {
        userHydrator(ctx, () => {
            acl(ctx, cb)
        })
    }

    testForbid(t,pipeline,{})
    testAllow (t,pipeline,{method:'get'})
    testForbid(t,pipeline,{method:'get', user: 'spambot3000'})
    testAllow (t,pipeline,{method:'search'})
    testForbid(t,pipeline,{method:'create'})
    testAllow (t,pipeline,{collection:'test-collection'})
    testAllow (t,pipeline,{method:'create',collection:'test-collection'})
    testAllow (t,pipeline,{method:'create',user:{role:'admin'}})
    testAllow (t,pipeline,{method:'revise',user:{id:'john@doe'},anno:{creator:'john@doe'}})
    testForbid(t,pipeline,{method:'revise',user:{id:'nolan'},anno:{creator:'john@doe'}})
    testAllow (t,pipeline,{method:'create',user:{perm:[{collection:'default', role:['create']}]}})
    testAllow (t,pipeline,{method:'revise',user:'mike'})
    testAllow (t,pipeline,{method:'create',user:'john'})
    testAllow (t,pipeline,{method:'create',user:{id:'john'}})
    t.end()
})
