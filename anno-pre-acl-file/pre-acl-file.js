const fs = require('fs')
const errors = require('@kba/anno-errors')
const chokidar = require('chokidar')
const YAML = require('js-yaml')
const {acl, defaultRules} = require('@kba/anno-acl')
const {envyConf} = require('envyconf')


module.exports = function PreAclFileFactory() {
    const {ACL_FILE} = envyConf('ANNO', {
        ACL_FILE: '/ACL-FILE-NOT-SET.json'
    })
    var processor = new acl()

    function parseContents(err, contents) {
        if (err) {
            console.log(new Error(`Error reading file ${ACL_FILE} ${err}`))
            return
        }
        let rules = (ACL_FILE.endsWith('.yml')) 
            ? YAML.safeLoad(contents)
            : JSON.parse(contents)
        processor = new acl(rules)
    }
    try {
        const contents = fs.readFileSync(ACL_FILE)
        parseContents(null, contents)
    } catch (err) {
        console.log(errors.fileNotFound(ACL_FILE, err))
        throw(errors.fileNotFound(ACL_FILE, err))
    }

    chokidar
        .watch(ACL_FILE, {persistent: true})
        .on('change', () => {
            console.log("***** ACL FILE Changed *****")
            fs.readFile(ACL_FILE, parseContents)
        })

    return function PreAclFile(...args) {
        return processor.process(...args)
    }
}
