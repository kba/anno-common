const Model = require('./Model')
module.exports = class Annotation extends Model {

  static get tableName() {return 'Annotation'}

  static get relationMappings() {
    return {

      type: {
        relation: Model.HasManyRelation,
        modelClass: `${__dirname}/AnnotationType`,
        join: {
          from: 'AnnotationType.ofAnnotationId',
          to: 'Annotation._id',
        }
      },

      body: {
        relation: Model.HasManyRelation,
        modelClass: `${__dirname}/AnnotationTextualBody`,
        join: {
          from: 'AnnotationTextualBody.ofAnnotationId',
          to: 'Annotation._id',
        }
      },

      target: {
        relation: Model.HasManyRelation,
        modelClass: `${__dirname}/AnnotationTarget`,
        join: {
          from: 'AnnotationTarget.ofAnnotationId',
          to: 'Annotation._id',
        }
      },

      creators: {
        relation: Model.HasManyRelation,
        modelClass: `${__dirname}/Person`,
        join: {
          from: 'Person._id',
          to: 'Annotation._id',
        }
      },

    }
  }

}

