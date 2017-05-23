const fs = require('fs')
const errors = require('@kba/anno-errors')
const chokidar = require('chokidar')
const YAML = require('js-yaml')
const {envyConf} = require('envyconf')
const UserProcessor = require('@kba/anno-user')

function PreUserFileFactory() {
    const {USER_FILE} = envyConf('ANNO', {
        USER_FILE: '/USER-FILE-NOT-SET.json'
    })
    var processor = new UserProcessor()

    function parseContents(err, contents) {
        if (err) {
            console.log(new Error(`Error reading file ${USER_FILE} ${err}`))
            return
        }
        let rules = (USER_FILE.endsWith('.yml')) 
            ? YAML.safeLoad(contents)
            : JSON.parse(contents)
        processor = new UserProcessor(rules)
    }
    try {
        const contents = fs.readFileSync(USER_FILE)
        parseContents(null, contents)
    } catch (err) {
        console.log(errors.fileNotFound(USER_FILE, err))
        throw(errors.fileNotFound(USER_FILE, err))
    }

    chokidar
        .watch(USER_FILE, {persistent: true})
        .on('change', () => {
            console.log("***** USER_FILE Changed *****")
            fs.readFile(USER_FILE, parseContents)
        })

    return function PreUserFile(...args) {
        return processor.process(...args)
    }
}

module.exports = PreUserFileFactory
