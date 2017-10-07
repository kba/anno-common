const Model = require('./Model')
module.exports = class AnnotationType extends Model {

  static get tableName() {return 'AnnotationType'}

  static get relationMappings() {
    return {

      ofAnnotation: {
        relation: Model.BelongsToOneRelation,
        modelClass: `${__dirname}/Annotation`,
        join: {
          from: 'AnnotationType.ofAnnotationId',
          to: 'Annotation._id',
        }
      },

    }
  }

}

