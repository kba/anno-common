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
                body: {type: ['TextualBody']},
                target: 'x://foo',
            },
            {
                body: {type: ['TextualBody']},
                target: {source: 'x://foo'},
            },
            {
                body: {type: ['TextualBody']},
                target: [{source: 'x://foo'}],
            },
        ],
    },
}

