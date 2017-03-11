module.exports = {
    AnnotationToPost: {
        notOk: [
            {
                id: 'foo',
                body: {type: ['oa:Tag']},
                target: 'x://foo',
            },
        ],
        ok: [
            {
                body: {type: ['oa:Tag']},
                target: 'x://foo',
            },
            {
                body: {type: ['oa:Tag']},
                target: {source: 'x://foo'},
            },
            {
                body: {type: ['oa:Tag']},
                target: [{source: 'x://foo'}],
            },
        ],
    },
    FullAnnotation: {
        notOk: [
            {},
            {
                id: 'http://foo',
                body: {},
                target: [],
                created: '2010-01-01T00:00:00Z',
                creator: 'x@y',
                hasReply: [],
            },
        ],
        ok: []
    }
}

