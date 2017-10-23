/**
 * ### `splitIdRepliesRev(str)`
 *
 * Split a slug (last URI segment) into annotation ID, reply ID and revision ID.
 *
 */
function splitIdRepliesRev(str) {
    const origStr = str
    // const ret = {
    //     _replyids: []
    // }

    str = str.replace(/https?:\/\/.*\//, '')

    let _id
    str = str.replace(/^([^\.~]+)/, (_, id) => {
        _id = id
        return ''
    })

    let _replyids = []
    str = str.replace(/\.(\d+)/g, (_, replyid) => {
        _replyids.push(parseInt(replyid))
        return ''
    })

    let _revid
    str = str.replace(/~(\d+)/, (_, revid) => {
        _revid = revid
        return ''
    })
    if (str) throw new Error(`Could not parse '${origStr}' into id/replyid/revid, '${str}' remained`)

    let _fullid = _replyids.length ? `${_id}.${_replyids.join('.')}` : _id
    if  (_revid) _fullid += `~${_revid}`

    return {_id, _replyids, _revid, _fullid}
}

module.exports = {splitIdRepliesRev}
