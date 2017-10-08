const Model = require('./Model')
module.exports = class Uri extends Model {

  static get tableName() {return 'Uri'}

  static get relationMappings() {
    return {

      ofAnnotation: {
        relation: Model.BelongsToOneRelation,
        modelClass: `${__dirname}/AnnotationRevision`,
        join: {
          from: 'Uri.revId',
          to: 'AnnotationRevision._id',
        }
      },

    }
  }

}

