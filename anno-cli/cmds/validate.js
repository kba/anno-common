const fs = require('fs')
exports.command = 'validate <files..>'
exports.desc = 'Validate an annotation'
exports.handler = function(argv) {
    const {Annotation,Choice} = require('@kba/anno-schema').validate
    argv.files.forEach(filename => {
        fs.readFile(filename, (err, data) => {
            const anno = JSON.parse(data)
            const validFn = Annotation
            if (!validFn(anno)) {
                console.log(`not ok - ${filename}`)
                console.log(JSON.stringify(validFn.errors, null, 2).replace(/^/mg, '  # '))
            } else {
                console.log(`ok - ${filename}`)
            }
        })
    })
}
