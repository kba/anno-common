exports.command = 'create-tag <target> <tag> [tags..]'
exports.desc = 'Tag a target'
exports.builder = {
    dir: {
        default: '.'
    }
}
exports.handler = function (argv) {
    argv.tags.unshift(argv.tag)
    delete argv.tag
    const store = require('@kba/anno-store').load(module)
    store.init(err => {
        const anno = {target: argv.target, body: {type:['oa:Tag'], value: argv.tags[0]}}
        store.create(anno, (err, annoSaved) => {
            if (err) return console.error(err)
            console.log(annoSaved)
        })
        console.log('store initialized')
    })
}
