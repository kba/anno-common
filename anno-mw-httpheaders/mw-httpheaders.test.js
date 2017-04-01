const tap = require('tap')
const HttpHeaderMiddleware = require('./mw-httpheaders')

tap.test('httpheaders', t => {
    process.env.ANNO_HTTPHEADERS = `Authorization: Bearer MY-TOKEN|X-Custom-Header: Some value
    Accept :	text/plain
    `
    const mw = new HttpHeaderMiddleware()
    const ctx = {}
    mw(ctx, (err) => {
        t.deepEquals(ctx, {httpHeaders:{
            'Authorization':   'Bearer MY-TOKEN',
            'X-Custom-Header': 'Some value',
            'Accept': 'text/plain',
        }}, 'headers set')
        t.end()
    })
})
