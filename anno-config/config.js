var ENV
try {
    ENV = window
} catch (e) {
    ENV = process.env
}
const PREFIX = 'ANNO';
const PREFIX_RE = new RegExp(`^${PREFIX}_`)
const DEFAULTS = {
    DEBUG: 'false',
    // NEDB_DIR: __dirname + '/' + '../nedb',
    STORE: '@kba/anno-store-file',
}

function loadConfig(localDefaults={}) {

    const CONFIG = JSON.parse(JSON.stringify(DEFAULTS))
    Object.assign(CONFIG, JSON.parse(JSON.stringify(localDefaults)))

    Object.keys(ENV)
        .filter(k => k.match(PREFIX_RE))
        .forEach(k => CONFIG[k.replace(PREFIX_RE, '')] = ENV[k])

    Object.keys(CONFIG)
        .forEach(k => {
            if (typeof CONFIG[k] === 'string' && CONFIG[k].match(/^true|false$/))
                CONFIG[k] = CONFIG[k] !== 'false'
            ENV[`${PREFIX}_${k}`] = CONFIG[k]
        })

    return CONFIG
}

function getLogger(category) {
    var isNode; try { isNode = window !== undefined } catch (err) {isNode = true}
    const config = loadConfig({
        LOGFILE: '/tmp/anno.log',
        LOGLEVEL: 'silly',
    })
    const format = function format(level, message) {
        if (typeof message != 'string') message = JSON.stringify(message)
        const timestamp = new Date().toISOString().substr(11).substr(0, 11)
        return `# ${level} [${timestamp}] ${category} - ${message}`
    }
    const logEnabled = function logEnabled(level, cb) {
        if (level.match(/debug/i) && config.LOGLEVEL.match(/(silly|debug)/i)) return cb()
        if (level.match(/SILLY/i) && config.LOGLEVEL.match(/silly/i)) return cb()
    }
    if (isNode && config.LOGFILE !== '') {
        const fs = require('fs')
        return {
            silly: (...msgs) => logEnabled('silly', () => msgs.forEach(msg =>
                fs.appendFile(config.LOGFILE, format('SILLY', msg+'\n'), ()=>{}))),
            debug: (...msgs) => logEnabled('debug', () => msgs.forEach(msg =>
                fs.appendFile(config.LOGFILE, format('DEBUG', msg+'\n'), ()=>{}))),
        }
    }
    return {
        silly: (...msgs) => logEnabled('SILLY', () => msgs.forEach(msg =>
            console[isNode ? 'log' : 'debug'](format('SILLY', msg)))),
        debug: (...msgs) => logEnabled('DEBUG', () => msgs.forEach(msg =>
            console.log(format('DEBUG', msg)))),
    }
}

module.exports = {
    loadConfig,
    getLogger,
}
