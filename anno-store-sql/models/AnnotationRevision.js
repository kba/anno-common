const Model = require('./Model')
const {tblToProp} = require('../transform')

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
  },


  // creators: {
  //   relation: Model.HasManyRelation,
  //   modelClass: `${__dirname}/Person`,
  //   join: {
  //     from: 'Person._id',
  //     to: 'Annotation._id',
  //   }
  // },

}

Object.keys(tblToProp).map(tbl => {
  tblToProp[tbl].map(_prop => {
    relationMappings[`${_prop}${tbl}s`] = {
      relation: Model.HasManyRelation,
      modelClass: `${__dirname}/${tbl}`,
      filter: {_prop},
      join: {
        from: `${tbl}._revId`,
        to: 'AnnotationRevision._id',
      }
    }
    relationMappings[`${_prop}Uris`] = {
      relation: Model.HasManyRelation,
      modelClass: `${__dirname}/Uri`,
      filter: {_prop},
      join: {
        from: `Uri._revId`,
        to: 'AnnotationRevision._id',
      }
    }
  })
})
console.log(relationMappings)
// process.exit()

module.exports = class AnnotationRevision extends Model {

  static get tableName() {return 'AnnotationRevision'}

  static get relationMappings() {
    return relationMappings
  }

}

