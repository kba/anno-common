const fs = require('fs')
const yaml = require('js-yaml')

function yaml2json(infile) {
    const outfile = infile.replace('.yml', '.json')
    const obj = yaml.safeLoad(fs.readFileSync(infile, {encoding:'utf8'}))
    fs.writeFileSync(outfile, JSON.stringify(obj, null, 2), {encoding:'utf8'})
}
process.argv.slice(2).forEach(infile => {
    yaml2json(infile)
})
