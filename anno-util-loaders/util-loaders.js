const ConfigReloader = require('./config-reloader')
const StaticLoader = require('./static-loader')

const async = require('async')
const {envyLog} = require('envyconf')
function loadPlugins(modNames, options, cb) {
    if (typeof options === 'function') [cb, options] = [options, {}]
    if (!(options.loadingModule)) throw new Error("Must provide 'loadingModule' option")
    if (!(options.afterLoad)) throw new Error("Must provide 'afterLoad' option")
    const log = envyLog('ANNO', 'loadPlugins')
    modNames = modNames
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '')
    async.eachSeries(modNames, (modNameRaw, next) => {
        const [modName, modImport] = modNameRaw.split(':')
        var mod;
        try {
            log.silly(`Loading module ${modName}${modImport?'/'+modImport:''} for ${options.loadingModule.filename}`)
            mod = options.loadingModule.require(modName)
        } catch (err) {
            console.log(err)
            console.error(`Please install '${modName}'`)
            process.exit(1)
        }
        const plugin = modImport ? mod[modImport]() : mod()
        options.afterLoad(plugin, next)
    }, cb)
}

module.exports = {
    StaticLoader,
    ConfigReloader,
    loadPlugins,
}
