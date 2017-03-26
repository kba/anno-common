const fs = require('fs')
const yaml = require('js-yaml')

function yaml2json(infile) {
    infile = `${__dirname}/../${infile}.yml`
    const outfile = infile.replace('.yml', '.json')
    const obj = yaml.safeLoad(fs.readFileSync(infile, {encoding:'utf8'}))
    fs.writeFileSync(outfile, JSON.stringify(obj, null, 2), {encoding:'utf8'})
}
yaml2json('data-model')
yaml2json('context')
yaml2json('openapi')
