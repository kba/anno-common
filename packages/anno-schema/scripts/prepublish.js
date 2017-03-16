const fs = require('fs')
const yaml = require('js-yaml')
const infile = `${__dirname}/../schema.yml`
const outfile = infile.replace('.yml', '.json')
const schema = yaml.safeLoad(fs.readFileSync(infile, {encoding:'utf8'}))
fs.writeFileSync(outfile, JSON.stringify(schema, null, 2), {encoding:'utf8'})

