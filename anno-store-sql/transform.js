const prune = require('object-prune')
const inspect = require('@kba/anno-util/inspect')
const {
  splitIdRepliesRev,
  ensureArray,
  packArray
} = require('@kba/anno-util')
const {
  AnnotationRevision,
  Resource
} = require('./models')

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
    Object.keys(AnnotationRevision.tblToProp).map(
      tbl => AnnotationRevision.tblToProp[tbl].map(
        prop => {
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
      } else if (Object.keys(AnnotationRevision.propToTbl).includes(k)) {
        ensureArray(anno, k)
        anno[k].map(v => {
          if (typeof v === 'string') {
            sqlRev[`${k}Uris`].push({uri: v, _prop: k})
          } else if (AnnotationRevision.propToTbl[k] === 'Resource') {
            sqlRev[`${k}Resources`].push(this.resourceFromJSONLD(v))
          } else {
            console.warn(`UNHANDLED CASE: ${AnnotationRevision.propToTbl[k]}`)
          }
        })
      } else if (k === '@context') {
        // XXX Ignore @context
      } else if (k === 'type') {
        ensureArray(anno, k)
        sqlRev.type = anno.type.map(t => {return {_id: t}})
      } else {
        console.warn(`UNHANDLED AnnotationRevision PROPERTY: '${k}'=${JSON.stringify(anno[k])}`)
      }
    })
    return sqlRev
  }

  _modelFromJSONLD(input, {
    literalProps,
    model,
  }) {
    const ret = {}
    Object.keys(model.tblToProp).map(
      tbl => model.tblToProp[tbl].map(
        prop => {
          ret[`${prop}${tbl}s`] = []
          ret[`${prop}Uris`] = []
        }))
    // console.log(ret)
    // process.exit()
    Object.keys(input).map(k => {
      if (literalProps.includes(k)) {
        ret[k] = input[k]
      } else if (Object.keys(model.propToTbl).includes(k)) {
        ensureArray(input, k)
        input[k].map(v => {
          if (typeof v === 'string') {
            ret[`${k}Uris`].push({uri: v, _prop: k})
          } else if (model.propToTbl[k] === 'Resource') {
            ret[`${k}Resources`].push(this.resourceFromJSONLD(v))
          } else {
            console.warn(`UNHANDLED ${model.name} CASE: ${Resource.propToTbl[k]}`)
          }
        })
      } else if (k === '@context') {
        // XXX Ignore @context
      } else if (k === 'type') {
        ensureArray(input, k)
        ret.type = input.type.map(t => {return {_id: t}})
      } else {
        console.warn(`UNHANDLED ${model.name} PROPERTY: '${k}'=${JSON.stringify(input[k])}`)
      }
    })
    prune.emptyArrays(ret)
    inspect.log({ret})
    return ret
  }

  resourceFromJSONLD(resource) {
    return this._modelFromJSONLD(resource, {
      literalProps: [
        'created',
        'modified',
        'generated',
        'rights',
        'id',
        'purpose',
        'value',
        'source',
        'styleClass',
      ],
      model: Resource
    })
  }

  revFromJSONLD(resource) {
    return this._modelFromJSONLD(resource, {
      literalProps:
      [
        'created',
        'modified',
        'generated',
        'motivation',
        'purpose',
        'rights',
        'via',
        'canonical',
      ],
      model: AnnotationRevision
    })
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

    Object.keys(resource).map(k => packArray(resource, k))

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
