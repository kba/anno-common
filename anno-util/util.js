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

function splitIdRepliesRev(str) {
    const origStr = str
    const ret = {
        _replyids: []
    }
    str = str.replace(/^([^\.~]+)/, (_, _id) => {
        ret._id = _id
        return ''
    })
    str = str.replace(/\.(\d+)/g, (_, _replyid) => {
        ret._replyids.push(parseInt(_replyid))
        return ''
    })
    str = str.replace(/~(\d+)/, (_, _revid) => {
        ret._revid = _revid
        return ''
    })
    if (str) throw new Error(`Could not parse ${origStr} into id/replyid/revid`)
    return ret
}

//
// Helpers to deal with annotation properties being arrays/objects/strings
//

function ensureArray(anno, k) {
    if (!Array.isArray(anno[k]))
        anno[k] = anno[k] === undefined ? [] : [anno[k]]
}

function add(anno, k, v) {
    if (anno[k] === undefined || anno[k] === null) anno[k] = v
    else anno[k].push(v)
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

//
// Type checking / filtering
//

function filter(needle, match) {
    if (Array.isArray(needle)) return needle.filter(match)
    else if (match(needle)) return [needle]
}

function find(needle, match) {
    if (Array.isArray(needle)) return needle.find(match)
    else if (match(needle)) return needle
}

function isHtmlBody(body) { return body && body.type === 'TextualBody' && body.format === 'text/html' }

function isSimpleTagBody(body) { return body && body.motivation === 'tagging' }

function isSemanticTagBody(body) { return body && (
    body.motivation === 'linking' || body.motivation === 'identifying' || body.motivation === 'classifying')
}

function isSvgTarget(t) { return t && t.selector && t.selector.type === 'SvgSelector' }

function firstHtmlBody(anno) {
    return find(anno.body, isHtmlBody)
}

function simpleTagBodies(anno) {
    return filter(anno.body, isSimpleTagBody)
}

function semanticTagBodies(anno) {
    return filter(anno.body, isSemanticTagBody)
}

function svgTarget(anno) {
    return find(anno.target, isSvgTarget)
}

//
// collectIds from a list
//

// TODO recursively for replies
function collectIds(list) {
    function _collectIds(list, _ret) {
        list.forEach(obj => {
            if (!obj) return;
            if (obj.id) _ret.push(obj.id)
            if (typeof obj === 'object') {
                Object.keys(obj).forEach(k => {
                    if (Array.isArray(obj[k])) _collectIds(obj[k], _ret)
                    else _collectIds([obj[k]], _ret)
                })
             }
        })
        return ret
    }
    const ret = []
    _collectIds(list, ret)
    console.log(ret)
    return ret
}

module.exports = {

    pruneEmptyStrings,
    pruneEmptyArrays,
    pruneEmptyObjects,
    prune,

    splitIdRepliesRev,

    ensureArray,
    add,
    remove,
    numberOf,

    find,
    filter,

    isHtmlBody,
    isSimpleTagBody,
    isSemanticTagBody,
    isSvgTarget,

    firstHtmlBody,
    simpleTagBodies,
    semanticTagBodies,
    svgTarget,

    collectIds,

}
