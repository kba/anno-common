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

      selector: {
        relation: Model.HasOneRelation,
        modelClass: `${__dirname}/Selector`,
        join: {
          from: 'Resource._selId',
          to: 'Selector._id',
        }
      },

      state: {
        relation: Model.HasOneRelation,
        modelClass: `${__dirname}/State`,
        join: {
          from: 'Resource._stateId',
          to: 'State._id',
        }
      }

    }
  }

}

