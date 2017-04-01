const fs = require('fs')
const async = require('async')
const path = require('path')

const ret = {}
const root = __dirname
const cases = {ok:{}, notOk:{}}
for (let type of fs.readdirSync(root)) {
    if (type === 'node_modules') continue
    const typeDir = path.resolve(root, type)
    if (!fs.statSync(typeDir).isDirectory()) continue
    ret[type] = JSON.parse(JSON.stringify(cases))
    for (let okOrNotOk in cases) {
        console.error(`${root}/${type}/${okOrNotOk}`)
        for (let file of fs.readdirSync(`${root}/${type}/${okOrNotOk}`)) {
            if (!file.match(/\.json(ld)?$/)) continue
            ret[type][okOrNotOk][file] = JSON.parse(
                fs.readFileSync(`${root}/${type}/${okOrNotOk}/${file}`, {encoding: 'utf-8'}))
        }
    }
}
console.log(JSON.stringify(ret, null, 2))
