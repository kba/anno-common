const Model = require('./Model')
module.exports = class AnnotationTextualBody extends Model {

  static get tableName() {return 'AnnotationTextualBody'}

  static get relationMappings() {
    return {

      ofAnnotation: {
        relation: Model.BelongsToOneRelation,
        modelClass: `${__dirname}/Annotation`,
        join: {
          from: 'AnnotationTextualBody.ofAnnotationId',
          to: 'Annotation._id',
        }
      },

    }
  }

}

