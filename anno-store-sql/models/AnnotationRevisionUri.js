const Model = require('./Model')
module.exports = class AnnotationRevisionUri extends Model {

  static get tableName() {return 'AnnotationRevisionUri'}

  static get relationMappings() {
    return {

      ofAnnotation: {
        relation: Model.BelongsToOneRelation,
        modelClass: `${__dirname}/AnnotationRevision`,
        join: {
          from: 'AnnotationRevisionUri.revId',
          to: 'AnnotationRevision._id',
        }
      },

    }
  }

}

