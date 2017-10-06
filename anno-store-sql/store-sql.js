const knex       = require('knex')
const knexConfig = require('./knexfile')
const {Model}    = require('objection')
Model.knex(knex(knexConfig.development))
module.exports = require('./models')
const Store = require('@kba/anno-store')

module.exports =
class SqlStore extends Store {
}

