const Model = require('./Model')
module.exports = class AnnotationTarget extends Model {

  static get tableName() {return 'AnnotationTarget'}

  static get relationMappings() {
    return {

      ofAnnotation: {
        relation: Model.BelongsToOneRelation,
        modelClass: `${__dirname}/Annotation`,
        join: {
          from: 'AnnotationTarget.ofAnnotationId',
          to: 'Annotation._id',
        }
      },

    }
  }

}

