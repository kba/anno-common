const {envyConf}  = require('envyconf')
const knex        = require('knex')
const knexCleaner = require('knex-cleaner')
const {Model}     = require('objection')
const errors      = require('@kba/anno-errors')
const schema      = require('@kba/anno-schema')
const Store       = require('@kba/anno-store')
const inspect     = require('@kba/anno-util/inspect')

const {splitIdRepliesRev} = require('@kba/anno-util')

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

    /* @override */
    _create(options, cb) {
      let anno = JSON.parse(JSON.stringify(options.anno))

      anno = this._deleteId(anno)
      anno = this._normalizeType(anno)

      const validFn = schema.validate.Annotation
      if (!validFn(anno)) {
          return cb(errors.invalidAnnotation(anno, validFn.errors))
      }

      const now = new Date()
      let sqlAnno = {
        _id: this._genid(),
        modified: now,
        revisions: [
          {
            created: now,
            bodyUris: [],
            bodyResources: [],
            targetUris: [],
            targetResources: [],
          }
        ]
      }
      if (options.collection) sqlAnno.collection = options.collection

      let sqlRev = sqlAnno.revisions[0]
      if ('id' in anno) sqlAnno.via = anno.id
      if ('generator' in anno) sqlRev.generator = anno.generator
      ;['body', 'target'].map(k => {
        if (k in anno) {
          if (typeof anno[k] === 'string') {
            sqlRev[`${k}Uris`].push({uri: anno[k], _prop: k})
          } else if (!(Array.isArray(anno[k]))) {
            anno[k]._prop = k
            sqlRev[`${k}Resources`].push(anno[k])
          } else {
            // TODO arrays
          }
        }
      })
      if ('type' in anno) {
        sqlRev.type = anno.type.map(t => {return {_id: t}})
      }

      // console.log("Inserting", sqlAnno)
      this.models.Annotation.query()
        .insertGraph(sqlAnno)
        .then(inserted => {
          // inspect.log({inserted})
          // inspect.log(this.transform.annoToJSONLD(inserted))
          // TODO should delegate to this.get once implemented
          cb(null, this.transform.annoToJSONLD(inserted))
        })
        .catch(err => {
          // TODO differentiate, use errors from anno-errors
          return cb(err)
        })
    }

    /* @override */
    _get(options, cb) {
      let annoId = this._idFromURL(options.annoId)
      let {_id, _replyids, _revid} = splitIdRepliesRev(annoId)
      this.models.Annotation.query()
        // .eager(this.models.Annotation.veryEager)
        .eager(`revisions.[bodyResources, bodyUris, targetResources, targetUris]`)
        .findOne({_id})
        .then((found) => {
          // inspect.log({found})
          cb(null, this.transform.annoToJSONLD(found))
        })
        .catch(err => {
          cb(err)
        })
    }

  }

