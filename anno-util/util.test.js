const tap = require('tap')
const {
  splitIdRepliesRev,
} = require('./util')

tap.test('splitIdRepliesRev', t => {
    const tests = {
        'foobar':       {_id: 'foobar', _fullid: 'foobar',       _unversioned: 'foobar',     _revid: null, _replyids:[]    },
        'foobar.1':     {_id: 'foobar', _fullid: 'foobar.1',     _unversioned: 'foobar.1',   _revid: null, _replyids:[1]   },
        'foobar.1~1':   {_id: 'foobar', _fullid: 'foobar.1~1',   _unversioned: 'foobar.1',   _revid: '1',  _replyids:[1],  },
        'foobar.1.3~1': {_id: 'foobar', _fullid: 'foobar.1.3~1', _unversioned: 'foobar.1.3', _revid: '1',  _replyids:[1, 3]},
    }
    Object.keys(tests).forEach(k => {
        t.deepEquals(splitIdRepliesRev(k), tests[k], k)
    })
    t.end()
})
