module.exports = {
    command: 'search [options]',
    desc: 'Search annotations',
    builder: {
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
        const {loadConfig, safeRequire} = require('@kba/anno-config')
        const config = loadConfig()
        const store = new(safeRequire(require, config.STORE))()
        store.init(err => {
            if (err) return console.error(err)
            const query = []

            if (argv.target) query.push({$target: argv.target}) 

            if (argv['target-type']) query.push({'target.type': argv.type})

            if (argv.id) query.push({'_id': {$regex: new RegExp(`${argv.id}$`)}})

            // if (argv.tag && ! Array.isArray(argv.tag)) argv.tag = [argv.tag]
            if (argv.tag) query.push({'body.type': 'oa:Tag', 'body.value': argv.tag})

            store.search({$and: query}, (err, found) => {
                if (err) return console.error(err)
                console.log(found)
            })
        })
    }
}
