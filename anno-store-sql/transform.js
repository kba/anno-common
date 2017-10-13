const inspect = require('@kba/anno-util/inspect')
const {
  splitIdRepliesRev,
  ensureArray,
  packArray
} = require('@kba/anno-util')

const tblToProp = {
  Resource: [
    'body',
    'target',
    'stylesheet',
  ],
  AnnotationAgent: [
    'generator',
    'audience',
    'creator',
  ]
}
const propToTbl = {}
Object.keys(tblToProp).map(tbl => {
  tblToProp[tbl].map(prop => {
    propToTbl[prop] = tbl
  })
})

class SqlToJSONLD {

  constructor(store) {
    this.store = store
  }

  // ----------------------------------------------------------------------
  // JSONLD -> SQL
  // ----------------------------------------------------------------------

  annoFromJSONLD(anno, options={}) {
    options.now = (options.now || new Date())
    const _id = options._id ? options._id : this.store._genid()
    let sqlAnno = {
      _id,
      modified: options.now,
      replies: [], // TODO
      revisions: [
        Object.assign(
          this.revFromJSONLD(anno, options),
          {_id: `${_id}~1`}
        )
      ]
    }
    if (options.collection) sqlAnno.collection = options.collection
    if ('id' in anno) sqlAnno.via = anno.id
    if ('replyTo' in anno) sqlAnno._replyTo = splitIdRepliesRev(anno.replyTo)._fullid

    return sqlAnno
  }

  revFromJSONLD(anno, options) {
    options.now = (options.now || new Date())
    const sqlRev = {
      created: options.now,
    }
    Object.keys(tblToProp).map(tbl => tblToProp[tbl].map(prop => {
      sqlRev[`${prop}${tbl}s`] = []
      sqlRev[`${prop}Uris`] = []
    }))
    // console.log(sqlRev)
    // process.exit()
    Object.keys(anno).map(k => {
      if ([
        'motivation',
        'purpose',
        'rights',
        'via',
        'canonical',
      ].includes(k)) {
        sqlRev[k] = anno[k]
      } else if (Object.keys(propToTbl).includes(k)) {
        ensureArray(anno, k)
        anno[k].map(v => {
          if (typeof v === 'string') {
            sqlRev[`${k}Uris`].push({uri: v, _prop: k})
          } else {
            v._prop = k
            sqlRev[`${k}${propToTbl[k]}s`].push(v)
          }
        })
      } else if (k === '@context') {
        // XXX Ignore @context
      } else if (k === 'type') {
        sqlRev.type = anno.type.map(t => {return {_id: t}})
      } else {
        console.warn(`UNHANDLED PROPERTY: '${k}'=${JSON.stringify(anno[k])}`)
      }
    })
    return sqlRev
  }

  mergeAnnoRev(anno, {_revid}) {
    let merged
    if (_revid === undefined) {
      const rev = anno.hasVersion[anno.hasVersion.length - 1]
      merged = Object.assign({}, rev, anno)
    } else {
      const rev = anno.hasVersion[_revid - 1]
      anno.versionOf = anno.id
      anno.id += `~${_revid}`
      delete anno.hasVersion
      merged = Object.assign({}, rev, anno)
    }
    // inspect.log({merged})
    return merged
  }

  // ----------------------------------------------------------------------
  // SQL -> JSONLD
  // ----------------------------------------------------------------------

  annoToJSONLD(sqlAnno, {_revid}={}) {
    // inspect.log({sqlAnno})
    const anno = {
      id: this.store._urlFromId(sqlAnno._id),
      hasVersion: sqlAnno.revisions.map(sqlRev => this.revToJSONLD(sqlRev)),
      // hasReply: sqlAnno.replies ? sqlAnno.replies.map(reply => this.annoToJSONLD(reply)),
      hasReply: !sqlAnno.replies ? [] : sqlAnno.replies.map(reply => this.annoToJSONLD(reply)),
    }
    if (sqlAnno._replyTo) anno.replyTo = this.store._urlFromId(sqlAnno._replyTo)
    return this.mergeAnnoRev(anno, {_revid})
  }

  uriToJSONLD({uri}) {
    return uri
  }

  resourceToJSONLD(resource) {
    resource = JSON.parse(JSON.stringify(resource))
    Object.keys(resource)
      .filter(k => k.startsWith('_'))
      .map(k => delete resource[k])

    Object.keys(resource)
      .map(k => packArray(resource, k))

    return resource
  }

  revToJSONLD(sqlRev, options={}) {
    const ret = {}
    ret.id = this.store._urlFromId(sqlRev._id)
    // TODO
    ;['body', 'target'].map(k => {
      ret[k] = []
      if (`${k}Uris` in sqlRev) ret[k].push(...sqlRev[`${k}Uris`].map(this.uriToJSONLD))
      if (`${k}Resources` in sqlRev) ret[k].push(...sqlRev[`${k}Resources`].map(this.resourceToJSONLD))
      if (`${k}Agents` in sqlRev) ret[k].push(...sqlRev[`${k}Agents`].map(this.resourceToJSONLD))
      packArray(ret, k)
    })
    return ret
  }

}

module.exports = (store) => new SqlToJSONLD(store)
module.exports.tblToProp = tblToProp
module.exports.propToTbl = propToTbl
