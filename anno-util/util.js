function pruneEmptyStrings(obj) {
    Object.keys(obj).forEach(k => {
        if (obj[k] === '' || obj[k] === null)
            delete obj[k]
        else if (obj[k] === '')
            delete obj[k]
        else if (typeof obj === 'object' && !Array.isArray(obj))
            pruneEmptyStrings(obj[k])
    })
    return obj
}

function pruneEmptyObjects(obj) {
    Object.keys(obj).forEach(k => {
        if (typeof obj === 'object' && !Array.isArray(obj))
            pruneEmptyObjects(obj[k])
        if (typeof obj[k] === 'object' && Object.keys(obj[k]).length === 0)
            delete obj[k]
    })
    return obj
}

function pruneEmptyArrays(obj) {
    Object.keys(obj).forEach(k => {
        if (Array.isArray(obj[k]) && obj[k].length === 0) {
            delete obj[k]
        } else if (typeof obj === 'object' && !Array.isArray(obj)) {
            pruneEmptyArrays(obj[k])
        }
    })
    return obj
}

function prune(obj) {
    obj = pruneEmptyStrings(obj)
    obj = pruneEmptyObjects(obj)
    obj = pruneEmptyArrays(obj)
    return obj
}

module.exports = {
    pruneEmptyStrings,
    pruneEmptyArrays,
    pruneEmptyObjects,
    prune,
}
