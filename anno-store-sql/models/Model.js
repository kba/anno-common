const {Model} = require('objection')

module.exports = class BaseModel extends Model {

  static get idColumn() {return '_id'}

  static get veryEager() {
    return this.relationMappings
      ?  `[${Object.keys(this.relationMappings).join(',')}]`
      : ''
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
