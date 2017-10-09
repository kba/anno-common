const {envyConf}  = require('envyconf')
const knex        = require('knex')
const knexCleaner = require('knex-cleaner')
const {Model}     = require('objection')
const schema      = require('@kba/anno-schema')
const Store       = require('@kba/anno-store')
const inspect     = require('@kba/anno-util/inspect')
const errors      = require('@kba/anno-errors')
const {targetId}  = require('@kba/anno-queries')

const {splitIdRepliesRev, ensureArray} = require('@kba/anno-util')
const EAGER = `[
  replies.[
    revisions,
  ],
  revisions.[
    bodyResources,
    bodyUris,
    targetResources,
    targetUris
  ]
]`

module.exports =
  class SqlStore extends Store {

    constructor(...args) {
      super(...args)
      this.transform = require('./transform')(this)
      envyConf('ANNO', {
        KNEXFILE: `${__dirname}/knexfile`,
      })
    }

    /* @override */
    _init(options, cb) {
      if (typeof options === 'function') [cb, options] = [options, {}]
      const {KNEXFILE} = envyConf('ANNO')
      const knexConfig = require(KNEXFILE)
      this.knex = knex(knexConfig.development)
      Model.knex(this.knex)
      this.models = require('./models')
      return cb()
    }

    /* @override */
    _wipe(options, cb) {
      if (typeof options === 'function') [cb, options] = [options, {}]
      if (!(this.knex)) return cb(new Error("Not initialized!"))
      knexCleaner.clean(this.knex, {
        mode: 'delete',
        ignoreTables: ['knex_migrations', 'knex_migrations_lock'],
      }).then(() => cb()).catch(cb)
    }

    /* @override */
    _disconnect(options, cb) {
      this.knex.destroy(cb)
    }

    _search(options, cb) {
      var {query} = options
      // TODO regex
      // const asRegex = query.$regex === 'true'  || query.$regex == 1
      // const nested = query.$nested === 'true'  || query.$nested == 1
      // delete query.$regex

      const qb = this.models.Annotation.query()
        .joinRelation('revisions')

      if (!(query.includeDeleted === 'true' || query.includeDeleted == 1)) {
        qb.where({deleted: null})
      }
      delete query.includeDeleted

      if ('$target' in query) {
        // qb.where('revisions
        const needle = query.$target
        query.$or = [
          {target: needle},
          {'target.id': needle},
          {'target.scope': needle},
          {'target.source': needle},
        ]
        delete query.$target
      }

      if (asRegex) {
        Object.keys(query).forEach(k => {
          if (typeof query[k] === 'string') {
            query[k] = {$regex: query[k]}
          }
        })
      }

      if (nested) {
        if (!query.$or)
          query.$or = []
        for (let i = 0; i < 20 ; i++) {
          const queryHere = {}
          for (let clause in query) {
            queryHere[`_reply.${i}.${clause}`] = JSON.parse(JSON.stringify(query[clause]))
          }
          query.$or.push(queryHere)
        }
      }


      const projection = this._projectionFromOptions(options)

      // console.log(JSON.stringify({query, projection}, null, 2))
      this.db.find(query, projection, (err, docs) => {
        if (err) return cb(err)
        if (docs === undefined) docs = []
        options.skipContext = true
        // mongodb returns a cursor, nedb a list of documents
        if (Array.isArray(docs))
          return cb(null, docs.map(doc => this._toJSONLD(doc._id, doc, options)))
        else
          docs.toArray((err, docs) => {
            if (err) return cb(err)
            return cb(null, docs.map(doc => this._toJSONLD(doc._id, doc, options)))
          })
      })
    }

    /* @override */
    _delete(options, cb) {
      // TODO recursion
      // TODO revisions
      const {_fullid, _revid} = splitIdRepliesRev(this._idFromURL(options.annoId))
      const qb = this.models.Annotation.query()
          .where({_id: _fullid})
      if (options.forceDelete) {
        console.log("FORCE DELETE", options)
        qb.delete()
      } else {
        qb.update({deleted: true})
      }
      return qb
    }


    _createReply(anno, options, cb) {
      anno = this._deleteId(anno)
      anno = this._normalizeType(anno)
      const validFn = schema.validate.Annotation
      if (!validFn(anno)) return cb(errors.invalidAnnotation(anno, validFn.errors))
      const {_fullid} = splitIdRepliesRev(targetId(anno))

      this.models.Annotation.query()
        .findOne({_id: _fullid})
        .eager('replies')
        .then(replyTo => {
          options._id = replyTo._id + `.${replyTo.replies.length + 1}`
          const sqlAnno = this.transform.annoFromJSONLD(anno, options)
          this.models.Annotation.query()
            .insertGraph(sqlAnno)
            .then(reply => this.get(reply._id, cb))
            .catch(cb)
        })
        .catch(cb)
    }

    /* @override */
    _create(options, cb) {
      let anno = JSON.parse(JSON.stringify(options.anno))
      if (anno.replyTo) {
        return this._createReply(anno, options, cb)
      }

      anno = this._deleteId(anno)
      anno = this._normalizeType(anno)
      const validFn = schema.validate.Annotation
      if (!validFn(anno)) return cb(errors.invalidAnnotation(anno, validFn.errors))
      const sqlAnno = this.transform.annoFromJSONLD(anno, options)

      // console.log("Inserting", sqlAnno)
      this.models.Annotation.query()
        .insertGraph(sqlAnno)
        .then(inserted => {
          this.get(inserted._id, cb)
        })
        .catch(err => {
          // TODO differentiate, use errors from anno-errors
          return cb(err)
        })
    }

    /* @override */
    _get(options, cb) {
      let annoId = this._idFromURL(options.annoId)
      let {_fullid, _revid} = splitIdRepliesRev(annoId)
      this.models.Annotation.query()
        .eager(EAGER)
        .findOne({_id: _fullid})
        .then((found) => {
          if (!found) return cb(errors.annotationNotFound(_fullid))
          cb(null, this.transform.annoToJSONLD(found, {_revid}))
        }).catch(err => {
          console.log(err)
          cb(err)
        })
    }

    /* @override */
    _revise(options, cb) {
      const annoId = this._idFromURL(options.annoId)
      const {_fullid, _replyids} = splitIdRepliesRev(annoId)
      let isReply = _replyids.length
      let _revOf = _fullid
      // TODO replies
      this.models.AnnotationRevision.query()
        .where({_revOf})
        .orderBy('created', 'desc')
        .first()
        .then(latestRev => {
          let {_revid} = splitIdRepliesRev(latestRev._id)
          const sqlRev = this.transform.revFromJSONLD(options.anno, options)
          Object.assign(sqlRev, {
            _id: `${annoId}~${parseInt(_revid) + 1}`,
            _revOf,
          })
          if (isReply) sqlRev._replyTo = _revOf.replace(/\.[\d]+$/, '')
          return this.models.AnnotationRevision.query()
            .insertGraph(sqlRev)
            .then(inserted => cb(null, this.transform.revToJSONLD(sqlRev)))
            .catch(cb)
        })
        .catch(cb)
        // .insertGraph
    }

  }

