const tap = require('tap')
process.env.ANNO_STORE = '@kba/anno-store-memory'
process.env.ANNO_STORE_MIDDLEWARES = [
    '@kba/anno-mw-user-static',
    '@kba/anno-mw-acl-static',
].join(',')
tap.test('stuff', t => {
    const store = require('@kba/anno-store').load(module)
    const async = require('async')
    const asAnonymous = () => {return {}}
    const asAdmin = () => {return {user:'admin-user'}}
    async.waterfall([
        cb => store.init(asAdmin(), cb),
        cb => store.wipe(asAdmin(), cb),
        cb => store.disconnect(asAdmin(), cb),
        cb => store.init(asAdmin(), cb),
        cb => store.create({
            id: 'http://anno1', 
            body: {type:'TextualBody', value: 'foo'},
            target: {id: 'http://target1'},
        }, asAdmin(), cb),
        (annno, cb) => store.search(asAnonymous(), cb)
    ], (err, anno) => {
        if (err) throw(err)
        t.ok('passed')
        t.end()
        // console.log('yay', anno)
    })
})
