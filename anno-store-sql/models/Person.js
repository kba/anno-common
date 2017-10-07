const Model = require('./Model')
module.exports = class Person extends Model {

  static get tableName() {return 'Person'}

  static get relationMappings() {
    return {

    }
  }

}

