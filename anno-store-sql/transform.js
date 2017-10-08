const inspect     = require('@kba/anno-util/inspect')
const {ensureArray, packArray} = require('@kba/anno-util')

class SqlToJSONLD {

  constructor(store) {
    this.store = store
  }

  uriToJSONLD(uri) {return uri.uri}

  resourceToJSONLD(resource) {
    resource = JSON.parse(JSON.stringify(resource))
    Object.keys(resource)
      .filter(k => k.startsWith('_'))
      .map(k => delete resource[k])

    Object.keys(resource)
      .map(k => packArray(resource, k))

    return resource
  }

  revisionToJSONLD(sqlRev) {
    const ret = {}
    ;['body', 'target'].map(k => {
      ret[k] = []
      if (`${k}Uris` in sqlRev) ret[k].push(...sqlRev[`${k}Uris`].map(this.uriToJSONLD))
      if (`${k}Resources` in sqlRev) ret[k].push(...sqlRev[`${k}Resources`].map(this.resourceToJSONLD))
      packArray(ret, k)
    })
    return ret
  }

  annoToJSONLD(sqlAnno, {_revid}={}) {
    const anno = {
      id: this.store._urlFromId(sqlAnno._id),
      hasVersion: sqlAnno.revisions.map(sqlRev => this.revisionToJSONLD(sqlRev))
    }
    let rev
    if (!_revid) {
      rev = anno.hasVersion[anno.hasVersion.length - 1]
    } else {
      rev = anno.hasVersion[_revid]
      anno.id += `~${_revid}`
    }
    const merged = Object.assign({}, rev, anno)
    // inspect.log({merged})
    return merged
  }

  revFromJSONLD(anno, options, {now=new Date()}={}) {
    const sqlRev = {
      created: now,
      bodyUris: [],
      bodyResources: [],
      targetUris: [],
      targetResources: [],
    }
    if ('generator' in anno) sqlRev.generator = anno.generator
    ;['body', 'target'].map(k => {
      if (k in anno) {
        ensureArray(anno, k)
        anno[k].map(v => {
          if (typeof v === 'string') {
            sqlRev[`${k}Uris`].push({uri: v, _prop: k})
          } else {
            v._prop = k
            sqlRev[`${k}Resources`].push(v)
          }
        })
      }
    })
    if ('type' in anno) {
      sqlRev.type = anno.type.map(t => {return {_id: t}})
    }
    return sqlRev
  }

  annoFromJSONLD(anno, options, {now=new Date()}={}) {
    let sqlAnno = {
      _id: this.store._genid(),
      modified: now,
      revisions: [
        this.revFromJSONLD(anno, options, {now})
      ]
    }
    if (options.collection) sqlAnno.collection = options.collection
    if ('id' in anno) sqlAnno.via = anno.id

    return sqlAnno
  }

}

module.exports = (store) => new SqlToJSONLD(store)
