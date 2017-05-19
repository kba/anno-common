const tap = require('tap')

tap.test('sanity check', t => {
    process.env.ANNO_MW_USER_DATA = JSON.stringify({
        'jane': {
            public: {
                displayName: 'Jane Doe-Mustermann'
            }
        }
    })
    const retvals = [{creator: 'jane'}]
    require('.')()({retvals}, () => {
        t.deepEquals(retvals[0].creator, {displayName: 'Jane Doe-Mustermann'})
        t.end()
    })
})

