const foo = 42;
var template = require("pug-loader!./file.pug");
// console.log(document, template)
// window.x = template()
// console.log(document)
// console.log(process)
// console.log(process.env)
console.log(require('@kba/anno-schema'))
window.ANNO_QUUX = 32
const {loadConfig} = require('@kba/anno-config')
console.log(loadConfig)
console.log(loadConfig())
