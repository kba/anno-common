const Model = require('./Model')
module.exports = class Agent extends Model {

  static get tableName() {return 'Agent'}

  static get relationMappings() {
    return {

    }
  }

}

