//
// Helpers to deal with annotation properties being arrays/objects/strings
//

/**
 * ### `ensureArray(obj, k)`
 *
 * Ensure that `obj[k]` is an array.
 * 
 * - If `obj[k]` is an array, return it.
 * - If `obj[k]` is not defined or `null`, return an empty array
 * - Otherwise return an array consisting of `[obj[k]]` only
 *
 */
function ensureArray(anno, k) {
    if (!Array.isArray(anno[k])) {
        if (anno[k] === undefined || anno[k] === null)
            anno[k] = []
        else
            anno[k] = [anno[k]]
    }
    return anno[k]
}

/**
 * ### `add(obj, k, v)`
 *
 * Add or set `obj[k]` to `v`
 *
 * - If `obj[k]` is not defined or null, set `obj[k]` to `v`.
 * - Otherwise if `obj[k]` is an array, push `v`.
 * - Otherwise set `obj[k]` to an array of the old value and `v`
 * - If `obj[k]` is a single-value array, set `obj[k]` to this value.
 */
function add(anno, k, v) {
    // ensureArray(anno, k)
    if (anno[k] === undefined || anno[k] === null) anno[k] = v
    else if (Array.isArray(anno[k]))
        anno[k].push(v)
    else
        anno[k] = [anno[k], v]
    packArray(anno, k)
}

/**
 * ### `packArray(obj, k)`
 *
 * If obj[k] is a single-item array, replace it with the value.
 * If obj[k] is null, delete it
 */
function packArray(anno, k) {
    if (Array.isArray(anno[k]) && anno[k].length === 1) {
        anno[k] = anno[k][0]
    } else if (anno[k] === null) {
        delete anno[k]
    }
}

/**
 * ### `remove(obj, k, v)`
 *
 * Unset a value `v` in field `k` of `obj`.
 *
 * - If `obj[k]` is an array, splice `v` out of the array
 * - Otherwise if `obj[k]` is equal to `v`, set `obj[k]` to an empty array.
 *
 * ** NOTE** Do not `delete` obj[k] to make reactive libs like Angular, Vue or
 * React happy.
 */
function remove(obj, k, v) {
    if (Array.isArray(obj[k])) {
        var vIndex = obj[k].indexOf(v)
        obj[k].splice(vIndex, 1)
    } else if (obj.body === v) {
        obj[k] = []
    }
}

/**
 * ### `numberOf(obj, k)`
 * Get the number of values for field `k` of `obj`.
 */
function numberOf(obj, k) {
    return Array.isArray(obj[k]) ? obj[k].length
        : obj[k] ? 1
        : 0
}

/**
 * ### `filter(needle, match)`
 * [`Array.filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
 * that works on non-array single values.
 */
function filter(needle, match) {
    if (Array.isArray(needle)) return needle.filter(match)
    else if (match(needle)) return [needle]
}

/**
 * ### `find(needle, match)`
 * [`Array.find`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
 * that works on non-array single values.
 */
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
    packArray,
    filter
}
