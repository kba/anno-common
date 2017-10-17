const {Model} = require('objection')

module.exports = class BaseModel extends Model {

  static get idColumn() {return '_id'}

  static get veryEager() {
    return this.relationMappings
      ?  `[${Object.keys(this.relationMappings).join(',')}]`
      : ''
  }

  static get propToTbl() {
    const propToTbl = {}
    Object.keys(this.tblToProp).map(tbl => {
      this.tblToProp[tbl].map(prop => {
        propToTbl[prop] = tbl
      })
    })
    return propToTbl
  }

  static createUriOrResourceJoins(self, tblToProp, relationMappings) {

    // Resource, Agent
    Object.keys(tblToProp).map(tbl => {
      // creator, target, body ...
      tblToProp[tbl].map(_prop => {
        relationMappings[`${_prop}${tbl}s`] = {
          relation: Model.HasManyRelation,
          modelClass: `${__dirname}/${tbl}`,
          join: {
            from: `${tbl}._id`,
            through: {
              from: `${self}${tbl}._from`,
              filter: {_prop},
              to: `${self}${tbl}._to`,
            },
            to: `${self}._id`,
          }
        }
        relationMappings[`${_prop}Uris`] = {
          relation: Model.HasManyRelation,
          modelClass: `${__dirname}/${self}Uri`,
          filter: {_prop},
          join: {
            from: `${self}Uri._from`,
            to: `${self}._id`,
          }
        }
      })
    })
  }

  static findOne(where, eager='') {
    return new Promise((resolve, reject) => {
      eager = (!!eager) ? eager : this.veryEager
      this.query()
        .where(where)
        .eager(eager)
        .limit(1)
        .first()
        .select()
        .then(found => {
          if (found) resolve(found)
          else reject(`${JSON.stringify(where)} not found in ${this.tableName}`)
        })
        .catch(err => reject(err))
    })
  }

}
