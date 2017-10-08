const inspect     = require('@kba/anno-util/inspect')
const {packArray} = require('@kba/anno-util')

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

  annoToJSONLD(sqlAnno) {
    const anno = {
      id: this.store._urlFromId(sqlAnno._id),
      hasVersion: sqlAnno.revisions.map(sqlRev => this.revisionToJSONLD(sqlRev))
    }
    const newestRevision = anno.hasVersion[anno.hasVersion.length - 1]
    const merged = Object.assign({}, newestRevision, anno)
    inspect.log({merged})
    return merged
  }

}

module.exports = (store) => new SqlToJSONLD(store)
