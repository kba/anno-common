module.exports = {}
require('fs').readdirSync(__dirname)
  .filter(file => file !== 'index.js')
  .map(file => file.replace(/\.js$/, ''))
  .map(file => {
    console.log(`##  Registering model ${file}`)
    module.exports[file] = require(`./${file}`)
  })
