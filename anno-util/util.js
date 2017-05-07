const {
    ensureArray,
    add,
    remove,
    numberOf,
    find,
    filter
} = require('./array-like')

/**
 * ### `splitIdRepliesRev(str)`
 *
 * Split a slug (last URI segment) into annotation ID, reply ID and revision ID.
 *
 */
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


/*
 * ### `collectIds(listOfAnnotations)`
 *
 * Get a list of IDs of all annotations in a tree.
 *
 * ```js
 * collectIds([{id: 123}, {id: 'xyz', hasReply: [{id: 'foo'}]}])
 * // [123, 'xyz', 'foo']
 * ```
 *
 */
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
    // console.log(ret)
    return ret
}

module.exports = {

    ensureArray,
    add,
    remove,
    numberOf,
    find,
    filter,

    splitIdRepliesRev,
    collectIds,

}
