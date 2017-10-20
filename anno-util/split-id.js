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
    str = str.replace(/https?:\/\/.*\//, '')
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
    if (str) throw new Error(`Could not parse '${origStr}' into id/replyid/revid, '${str}' remained`)
    ret._fullid = ret._replyids.length ? `${ret._id}.${ret._replyids.join('.')}` : ret._id
    return ret
}

module.exports = {splitIdRepliesRev}
