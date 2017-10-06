process.env.ANNO_BASE_URL = `http://localhost:3000`
process.env.ANNO_BASE_PATH = ``
process.env.ANNO_SQL_BACKEND = `sqlite3`
process.env.ANNO_SQLITE_DBFILE = `${__dirname}/../temp/test.sqlite3`

const SqlStore = require('./store-sql')
const store = new SqlStore()
require('../anno-store/store-test')(store, () => {})
