const getStdin = require('get-stdin')
const path = require('path')
const prune = require('object-prune')
const {
    add
} = require('@kba/anno-util')
const {
    emptyAnnotation,
    mediaFragmentResource,
} = require('@kba/anno-queries')

exports.command = 'convert'
exports.desc = 'Convert data structures to annotations'
exports.builder = {
    cvp: {
        type: 'boolean',
        description: 'Process as cvp state dump',
        default: true
    },
}

// https://github.com/adamscybot/projectorjs/blob/gh-pages/demos/videojs.html
exports.handler = function (argv) {
    getStdin().then(str => {
        const anno = JSON.parse(argv.annotation)
        if (argv.cvp) {
            const data = JSON.parse(str)
            const target = Object.assign({
                type: 'Video',
                id: argv.idHandler(data.filename),
            }, mediaFragmentResource.create({value: `t=${data.currentTime}`}))
            add(anno, 'target', target)
            prune(anno)
            console.log(JSON.stringify(anno))
        }
    })

}
