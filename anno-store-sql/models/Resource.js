const Model = require('./Model')

const tableName = 'Resource'

const tblToProp = {
  Agent: [
    'creator',
    'generator',
    'renderedVia',
    'audience',
  ],
  Selector: [
    'selector'
  ],
}

const relationMappings = {

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
  },

  items: {
    relation: Model.HasManyRelation,
    modelClass: `${__dirname}/Resource`,
    join: {
      from: 'Resource._id',
      through: {
        from: 'Choice._resId',
        to: 'Choice._itemId',
      },
      to: 'Resource._id',
    }
  },

}

Model.createUriOrResourceJoins(tableName, tblToProp, relationMappings)

module.exports = class Resource extends Model {

  static get tableName() {return tableName}
  static get tblToProp() {return tblToProp}
  static get relationMappings() {return relationMappings}

}
