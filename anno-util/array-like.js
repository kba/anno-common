//
// Helpers to deal with annotation properties being arrays/objects/strings
//

function ensureArray(anno, k) {
    if (Array.isArray(anno[k]))
        return
    if (anno[k] === undefined || anno[k] === null)
        anno[k] = [] 
    else
        anno[k] = [anno[k]]
}

function add(anno, k, v) {
    // ensureArray(anno, k)
    if (anno[k] === undefined || anno[k] === null) anno[k] = v
    else if (Array.isArray(anno[k]))
        anno[k].push(v)
    else
        anno[k] = [anno[k], v]
    if (Array.isArray(anno[k]) && anno[k].length === 1) {
        anno[k] = anno[k][0]
    }
}

function remove(anno, k, v) {
    if (Array.isArray(anno[k])) {
        var vIndex = anno[k].indexOf(v)
        anno[k].splice(vIndex, 1)
    } else if (anno.body === v) {
        anno[k] = []
    }
}

function numberOf(anno, k) {
    return Array.isArray(anno[k]) ? anno[k].length
        : anno[k] ? 1
        : 0
}

function filter(needle, match) {
    if (Array.isArray(needle)) return needle.filter(match)
    else if (match(needle)) return [needle]
}

function find(needle, match) {
    if (Array.isArray(needle)) return needle.find(match)
    else if (match(needle)) return needle
}

module.exports = {
    ensureArray,
    add,
    remove,
    numberOf,
    find,
    filter
}
