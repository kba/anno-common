const PREFIX = 'ANNO';
const DEFAULTS = {
    JWT_SECRET: 'S3cr3t!',
    BASE_URL: 'http://localhost:3000',
    NEDB_DIR: __dirname + '/' + '../nedb',
    STORE: 'NEDB'
}
module.exports = function loadConfig() {

    const CONFIG = {}
    const prefixRe = new RegExp(`^${PREFIX}_`)

    Object.keys(DEFAULTS).forEach(k => {
        CONFIG[k] = (process.env[PREFIX + '_' + k] || DEFAULTS[k])
    })

    return CONFIG
}
