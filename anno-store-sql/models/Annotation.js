const Model = require('./Model')
module.exports = class Annotation extends Model {

  static get tableName() {return 'Annotation'}

  static get relationMappings() {
    return {

      replyTo: {
        relation: Model.HasOneRelation,
        modelClass: `${__dirname}/Annotation`,
        join: {
          from: 'Annotation._id',
          to: 'Annotation._replyTo'
        }
      },

      replies: {
        relation: Model.HasManyRelation,
        modelClass: `${__dirname}/Annotation`,
        join: {
          from: 'Annotation._id',
          to: 'Annotation._replyTo',
        }
      },

      revisions: {
        relation: Model.HasManyRelation,
        modelClass: `${__dirname}/AnnotationRevision`,
        join: {
          from: 'AnnotationRevision._revOf',
          to: 'Annotation._id'
        }
      }

    }
  }

}

