module.exports = {

  development: {
    client: 'sqlite3',
    useNullAsDefault: true,
    debug: process.env.KNEX_DEBUG || false,
    // debug: true,
    // seeds: {
    //     directory: './data/fixtures'
    // },
    connection: {
      filename: __dirname + '/../temp/example.sqlite3'
    },
    // XXX Otherwise sqlite won't constrain foreign keys
    pool: {
        afterCreate: (conn, cb) => conn.run('PRAGMA foreign_keys = ON', cb)
      }
    },

}
