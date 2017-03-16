module.exports = {
    command: 'search [options]',
    desc: 'Search annotations',
    builder: {
        json: {
            describe: 'Dump results as JSON',
            type: 'boolean',
            default: false,
        },
        format: {
            describe: 'mustache template for output',
            type: 'string',
            default: '{{ target.source }} -- {{ body.value }}',
        },
        target: {
            describe: 'search by target',
            type: 'string'
        },
        'body-type': {
            describe: 'search by body type',
            type: 'string'
        },
        tag: {
            describe: 'search by tag',
            type: 'string'
        },
        id: {
            describe: 'search by annotation id',
            type: 'string'
        }
    },
    handler: function (argv) {
        const mustache = require('mustache')
        process.env.ANNO_DEBUG = true
        const store = require('@kba/anno-store').load(module)
        store.init(err => {
            if (err) return console.error(err)
            const query = []

            if (argv.target) query.push({'target.source': argv.target}) 

            if (argv['target-type']) query.push({'target.type': argv.type})

            if (argv.id) query.push({'_id': {$regex: new RegExp(`${argv.id}$`)}})

            // if (argv.tag && ! Array.isArray(argv.tag)) argv.tag = [argv.tag]
            if (argv.tag) query.push({'body.type': 'oa:Tag', 'body.value': argv.tag})

            store.search({$and: query}, (err, found) => {
                if (err) return console.error(err)
                if (argv.json) {
                    console.log(JSON.stringify(found,null,2))
                } else {
                    found.forEach(anno => {
                        console.log(mustache.render(argv.format, anno))
                    })
                }
            })
        })
    }
}
