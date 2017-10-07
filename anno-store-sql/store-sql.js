const {envyConf, envyLog} = require('envyconf')
const knex                = require('knex')
const {Model}             = require('objection')
const errors              = require('@kba/anno-errors')
const schema              = require('@kba/anno-schema')
const Store               = require('@kba/anno-store')
const {splitIdRepliesRev} = require('@kba/anno-util')

module.exports =
  class SqlStore extends Store {

    constructor(...args) {
      super(...args)
      envyConf('ANNO', {
        KNEXFILE: `${__dirname}/knexfile`,
      })
    }

    /* @override */
    _init(options, cb) {
      if (typeof options === 'function') [cb, options] = [options, {}]
      const {KNEXFILE} = envyConf('ANNO')
      const knexConfig = require(KNEXFILE)
      Model.knex(knex(knexConfig.development))
      this.models = require('./models')
      return cb()
    }

    /* @override */
    _wipe(options, cb) {
      if (typeof options === 'function') [cb, options] = [options, {}]
      cb()
      // if (typeof options === 'function') [cb, options] = [options, {}]
      // fs.unlink(this.dbfilename, err => {
      //     if (err && err.code !== 'ENOENT')
      //         return cb(err)
      //     return this.init(options, cb)
      // })
    }

    /* @override */
    _create(options, cb) {
        let anno = JSON.parse(JSON.stringify(options.anno))
        anno = this._deleteId(anno)
        // anno = this._normalizeTarget(anno)
        anno = this._normalizeType(anno)
        const validFn = schema.validate.Annotation
        if (!validFn(anno)) {
            return cb(errors.invalidAnnotation(anno, validFn.errors))
        }
        if (options.collection) {
            anno.collection = options.collection
        }
      this.models.Annotation.query()
        .upsertGraph(anno)
        .then(() => {
          // // Mongodb returns an object describing the result, nedb returns just the results
          // if ('insertedIds' in savedAnno)
          //   return this.get(savedAnno.insertedIds[0], options, cb)
          // else
          //   return this.get(savedAnno._id, options, cb)
        })
        .catch(err => {
            // TODO differentiate, use errors from anno-errors
            return cb(err)
        })
    }

    /* @override */
    // TODO replies!
    _get(options, cb) {
        let annoId = this._idFromURL(options.annoId)
        const projection = this._projectionFromOptions(options)
        let {_id, _replyids, _revid} = splitIdRepliesRev(annoId)
        const query = {_id}
        this.db.findOne(query, projection, (err, doc) => {
            if (!doc) return cb(errors.annotationNotFound({annoId, _id, _replyids, _revid}))
            if (doc.deleted) return cb(errors.annotationDeleted(annoId, doc.deleted))
            for (let _replyid of _replyids) {
                // console.log({doc, _replyid})
                doc = doc._replies[_replyid - 1]
                if (!doc) {
                    return cb(errors.replyNotFound(annoId))
                }
            }
            if (!Array.isArray(doc._revisions)) {
                console.error("BAD ANNOTATION IN STORE", annoId)
            } else {
                const rev = (_revid)
                    ? doc._revisions[_revid -1]
                    : doc._revisions[doc._revisions.length - 1]
                if (!rev) return cb(errors.revisionNotFound(_id, _revid))

                if (options.latest) {
                    annoId = `${_id}~${doc._revisions.length}`
                    doc = rev
                }
            }

            if (_replyids.length) doc.replyTo = this._urlFromId(`${_id}${_replyids.map(x=>`.${x}`).join('')}`)
            if (_revid) doc.versionOf = this._urlFromId(_id)
            return cb(null, this._toJSONLD(annoId, doc, options))
        })
    }

  }

