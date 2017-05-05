process.env.ANNO_BASE_URL = `http://localhost:3000`
process.env.ANNO_BASE_PATH = `/anno`
process.env.ANNO_NEDB_DIR = `${__dirname}/../temp`

const FileStore = require('./store-file')
const store = new FileStore()
require('../anno-store/store-test')(store, () => {})
