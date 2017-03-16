exports.command = 'create <target> <value> [values..]'
exports.desc = 'Annotate a target'
exports.builder = {
    tag: {
        type: 'boolean',
        description: 'Treat values as tags',
        default: false
    }
}
exports.handler = function (argv) {
    argv.values.unshift(argv.value)
    delete argv.value

    const store = require('@kba/anno-store').load(module)
    store.init(err => {
        if (err) return console.error(err)
        const values = argv.values.map(value => {
            const anno = {target: argv.target, body: {type:[], value: value}}
            if (argv.tag)
                anno.body.type.push('oa:Tag')
            else
                anno.body.type.push('oa:TextualBody')
            return anno
        })
        store.create(values, (err, annoSaved) => {
            if (err) return console.error(err)
            console.log(annoSaved)
        })
    })
}
