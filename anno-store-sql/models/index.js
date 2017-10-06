module.exports = {}
require('fs').readdirSync(__dirname)
  .map(f => f.replace('.js', ''))
  .map(f => module.exports[f] = require(`./${f}`)
)
console.log(module.exports)
