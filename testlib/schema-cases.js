module.exports = {
    Annotation: {
        notOk: [
            {
                id: 'foo',
                body: {type: ['TextualBody']},
                target: 'x://foo',
            },
        ],
        ok: [
            {
                body: {type: ['TextualBody'], value: 'bla'},
                target: 'x://foo',
            },
            {
                body: {type: ['TextualBody'], value: 'bla'},
                target: {source: 'x://foo'},
            },
            {
                body: {type: ['TextualBody'], value: 'bla'},
                target: [{source: 'x://foo'}],
            },
        ],
    },
}

