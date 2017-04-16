#!/usr/bin/env node

const getStdin = require('get-stdin')
const path = require('path')
const {
    emptyAnnotation,
} = require('@kba/anno-queries')

const x = {}
x.fileIdHandler = function fileIdHandler(id, argv) {
    if (id.match(/^urn:/)) {
        return id
    }
    if (id.match(/^[a-z]+:\/\//)) {
        return id
    } else if (id.match(/^\//)) {
        return 'file://' + encodeURI(id)
    } else {
        return 'file://' + encodeURI(path.resolve(argv.cwd, id))
    }
}


var argv = require('yargs')
    .commandDir('cmds')
    .demandCommand()
    .help()
    .alias('h', 'help')
    .usage("$0 <cmd> <cmd-args>")
    .options({
        cwd: {
            type: 'string',
            description: 'Current working directory',
            default: process.cwd(),
        },
        // TODO
        'id-handler': {
            type: 'string',
            description: 'Function translating non-URL IDs to URL',
            default: 'fileIdHandler',
            coerce(str) { return x[str] }
        },
        'annotation': {
            type: 'string',
            alias: ['a'],
            description: 'Base annotation.',
            default: JSON.stringify(emptyAnnotation.create()),
        },
        'dry-run': {
            type: 'boolean',
            alias: ['n'],
            description: 'Output what would be passed to the store.',
            default: false
        },
    })
    .argv;
