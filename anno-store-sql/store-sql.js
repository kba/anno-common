const {envyConf}  = require('envyconf')
const knex        = require('knex')
const knexCleaner = require('knex-cleaner')
const {Model}     = require('objection')
const schema      = require('@kba/anno-schema')
const Store       = require('@kba/anno-store')
const inspect     = require('@kba/anno-util/inspect')
const errors      = require('@kba/anno-errors')
const {targetId}  = require('@kba/anno-queries')

const {
  splitIdRepliesRev,
  truthy,
} = require('@kba/anno-util')

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
      const {query} = options

      // TODO regex
      // const asRegex = truthy(query.$regex)
      // delete query.$regex

      // TODO nested, i.e. whether to search in replies
      // const nested = truthy(query.$nested)

      const qb = this.models.Annotation.query()
        .joinRelation('revisions')

      if (!(truthy(query.includeDeleted))) {
        qb.whereNull('deleted')
      }
      delete query.includeDeleted

      if ('$target' in query) {
        const needle = query.$target
        qb.where(function() {this
          .where(  {'revisions.target':        needle})
          .orWhere({'revisions.target.id':     needle})
          .orWhere({'revisions.target.scope':  needle})
          .orWhere({'revisions.target.source': needle})
        })
        delete query.$target
      }

      qb
        .eager(EAGER)
        .select()
        .then(annos => cb(null, annos.map(anno => this.transform.annoToJSONLD(anno))))
        .catch(cb)
    }

    /* @override */
    _delete(options, cb) {
      // TODO recursion
      // TODO revisions
      const {_fullid} = splitIdRepliesRev(this._idFromURL(options.annoId))
      const qb = this.models.Annotation.query()
        .where({_id: _fullid})
      if (options.forceDelete) {
        qb.delete()
      } else {
        qb.update({deleted: true})
      }
      return qb.then(() => cb()).catch(cb)
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
          if (!found)
            return cb(errors.annotationNotFound(options.annoId))
          if (found.deleted && !options.includeDeleted)
            return cb(errors.annotationDeleted(options.annoId))
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

