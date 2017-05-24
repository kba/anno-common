const {envyConf} = require('envyconf')

function StaticLoaderFactory(processorClass, envyconfName, sampleData='') {
    return function() {
        const DATA = envyConf('ANNO', {
            [envyconfName]: JSON.stringify(sampleData)
        })[envyconfName]
        const processor = new processorClass(JSON.parse(DATA))
        const ret = function(ctx, cb) {
            processor.process(ctx, cb)
        }
        ret.impl = processorClass.name
        return ret
    }

}

module.exports = StaticLoaderFactory
