const Model = require('./Model')
module.exports = class State extends Model {

  static get tableName() {return 'State'}

  static get relationMappings() {
    return {

      refinedBy: {
        relation: Model.HasOneRelation,
        modelClass: `${__dirname}/State`,
        join: {
          from: 'State._refinedBy',
          to: 'State._id',
        }
      }

    }
  }

}

