const {
    ensureArray,
    add,
    remove,
    numberOf,
    find,
    filter,
    packArray
} = require('./array-like')

const {
  splitIdRepliesRev
} = require('./split-id')

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
            if (!obj) return
            if (obj.id) _ret.push(obj.id)
            if (typeof obj === 'object') {
                Object.keys(obj).forEach(k => {
                    if (k === 'creator') return
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

/*
 * ### `applyToAnno(anno, fn, options, cb)`
 *
 * Apply a function `fn` to `anno` and all elements contained therein, then call `cb`)
 *
 * `fn` takes the annotation as first and a callback as second argument
 *
 * The main point is to handle recursion into replies/versions here.
 */
function applyToAnno(anno, fn, options, cb) {
    if (!options || typeof options === 'function') [cb, options] = [options, {}]
    options.nestedProps = options.nestedProps || ['hasReply', 'hasVersion']
    fn(anno)
    options.nestedProps.forEach(k => {
        if (!anno[k]) {
            return
        } else if (Array.isArray(anno[k])) {
            anno[k].forEach(subanno => {
                applyToAnno(subanno, fn, options, ()=>{})
            })
        } else if (typeof anno[k] === 'object') {
            applyToAnno(anno[k], fn, options, ()=>{})
        }
    })
    if (cb) return cb()
}

/**
 * Join a base URI and possibly empty path segments
 */
function urlJoin(...args) {
  return args.join('/')
    .replace(/\/\/+/g, '/')
    .replace(/\/+$/, '')
    .replace(':/', '://')
}

/**
 * Return whether a string value should be interpreted as boolean `true`.
 */
function truthy(str) {
  return str === true || str === 1 || str === 'true' || str === '1'
}


module.exports = {

    ensureArray,
    add,
    remove,
    numberOf,
    find,
    filter,
    packArray,

    splitIdRepliesRev,
    collectIds,
    applyToAnno,

    urlJoin,
    truthy,

}
