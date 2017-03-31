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

module.exports = {
    loadConfig
}
