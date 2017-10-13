const Model = require('./Model')
module.exports = class Selector extends Model {

  static get tableName() {return 'Selector'}

  static get relationMappings() {
    return {

      refinedBy: {
        relation: Model.HasOneRelation,
        modelClass: `${__dirname}/Selector`,
        join: {
          from: 'Selector._refinedBy',
          to: 'Selector._id',
        }
      }


    }
  }

}

