const Model = require('./Model')
module.exports = class Annotation extends Model {

  static get tableName() {return 'Annotation'}

  static get relationMappings() {
    return {

      creators: {
        relation: Model.HasManyRelation,
        modelClass: `${__dirname}/Person`,
        join: {
          from: 'Person.id',
          to: 'Annotation.id',
        }
      },

    }
  }

}

