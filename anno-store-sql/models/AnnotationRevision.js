const Model = require('./Model')

const tableName = 'AnnotationRevision'

const tblToProp = {
  Resource: [
    'body',
    'target',
    'stylesheet',
  ],
  Agent: [
    'generator',
    'audience',
    'creator',
  ]
}

const relationMappings = {

  type: {
    relation: Model.HasManyRelation,
    modelClass: `${__dirname}/Type`,
    join: {
      from: 'AnnotationRevision._id',
      through: {
        from: 'AnnotationType._revId',
        to: 'AnnotationType.typeId',
      },
      to: 'Type._id',
    }
  }

}

Model.createUriOrResourceJoins(tableName, tblToProp, relationMappings)
console.log(relationMappings.bodyUris)

module.exports = class AnnotationRevision extends Model {

  static get tableName() {return tableName}
  static get tblToProp() {return tblToProp}
  static get relationMappings() {return relationMappings}

}
