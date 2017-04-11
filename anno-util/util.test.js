const tap = require('tap')
const {prune, splitIdRepliesRev} = require('./util')

tap.test('prune', t => {
    t.deepEquals(prune({a:'', b:[], c:{}, bar:42}), {bar:42}, 'prune')
    t.deepEquals(prune({a:null, b:[], c:{}, bar:42}), {bar:42}, 'prune /null')
    t.end()
})

tap.test('splitIdRepliesRev', t => {
    const tests = {
        'foobar': {_id: 'foobar', _replyids:[]},
        'foobar.r1': {_id: 'foobar', _replyids:[1]},
        'foobar.r1~1': {_id: 'foobar', _replyids:[1], _revid: 1},
        'foobar.r1.r3~1': {_id: 'foobar', _replyids:[1,3], _revid: 1},
    }
    Object.keys(tests).forEach(k => {
        t.deepEquals(splitIdRepliesRev(k), tests[k], k)
    })
    t.end()
})
