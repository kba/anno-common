const tap = require('tap')
const UserMemoryMiddleware = require('.')
const {testUser} = require('../anno-user/user-test')
process.ANNO_DEBUG = false

testUser(tap, UserMemoryMiddleware())
