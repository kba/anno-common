const Model = require('./Model')
module.exports = class Resource extends Model {

  static get tableName() {return 'Resource'}

  static get relationMappings() {
    return {

      ofAnnotation: {
        relation: Model.BelongsToOneRelation,
        modelClass: `${__dirname}/AnnotationRevision`,
        join: {
          from: 'Resource.revId',
          to: 'AnnotationRevision._id',
        }
      },

    }
  }

}

