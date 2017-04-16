const getStdin = require('get-stdin')
const {add} = require('@kba/anno-util')
const path = require('path')
const prune = require('object-prune')
const {
    simpleTagBody,
    semanticTagBody,
    mediaFragmentResource,
} = require('@kba/anno-queries')

exports.command = 'create'
exports.desc = 'Annotate a target'
exports.builder = {
    cwd: {
        type: 'string',
        description: 'Current working directory',
        default: process.cwd(),
    },
    tag: {
        type: 'string',
        description: 'simple tags to assign',
        array: true,
    },
    semtag: {
        type: 'string',
        description: 'semantic tags (URI) to assign',
        array: true,
    },
    'target-id': {
        type: 'string',
        alias: ['target.id', 'ti'],
        description: 'ID of the target',
    },
    'target-type': {
        type: 'string',
        alias: ['target.type', 'tt'],
        description: "Type of the target",
        default: null,
    },
    mediafragment: {
        alias: ['mf'],
        type: 'string',
        description: 'Fragment selector',
    },
    stdin: {
        alias: ['i'],
        type: 'boolean',
        description: 'Read base annotation from STDIN',
    }
}

exports.handler = function (argv) {

    if (!argv.tag) argv.tag = []
    if (!argv.semtag) argv.semtag = []

    var target = argv.target
    if (argv.mediafragment) {
        target = Object.assign(mediaFragmentResource.create({value: argv.mediafragment}), target)
    }
    if (target.id) {
        target.id = argv.idHandler(target.id, argv)
    }

    new Promise((resolve, reject) => {
        if (argv.stdin) getStdin().then(resolve)
        else resolve(argv.annotation)
    }).then(annoJSON => {
        const anno = JSON.parse(annoJSON)
        argv.tag.map(value => add(anno, 'body', simpleTagBody.create({value})))
        argv.semtag.map(id => add(anno, 'body', semanticTagBody.create({id})))
        add(anno, 'target', target)
        prune(anno)
        if (argv.dryRun) {
            console.log(JSON.stringify(anno, null, 2))
            process.exit()
        }
        const store = require('@kba/anno-store').load(module)
        store.init(err => {
            if (err) return console.error(err)
            store.create(anno, (err, annoSaved) => {
                if (err) return console.error(err.message)
                // console.log(annoSaved)
            })
        })
    })
}
