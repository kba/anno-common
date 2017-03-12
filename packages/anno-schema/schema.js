const yaml = require('js-yaml')
const fs = require('fs')
const ajv = require('ajv')({
    allErrors: true
});

const schemaDef = yaml.safeLoad(fs.readFileSync(`${__dirname}/schema.yml`))

module.exports = {
    definitions: schemaDef.definitions,
    validate: {},
}

Object.keys(schemaDef.definitions).forEach(k => {
    const thisSchema = JSON.parse(JSON.stringify(schemaDef.definitions[k]))
    thisSchema.definitions = JSON.parse(JSON.stringify(schemaDef.definitions))
    module.exports.validate[k] = ajv.compile(thisSchema)
})
