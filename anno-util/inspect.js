const util = require('util')
const inspect = obj => util.inspect(obj, {colors: true, depth: 5})
inspect.log = (obj) => process.nextTick(() => console.log(inspect(obj)))
module.exports = inspect
