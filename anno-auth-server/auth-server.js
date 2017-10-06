const express = require('express')
const authRouter = require('./routes/auth')
const {envyConf} = require('envyconf')

const config = envyConf('ANNO', {
  AUTH_PORT: "3008",
  AUTH_SESSION_KEY: '9rzF3nWDAhmPS3snhh3nwe4RCDNebaIkg7Iw3aJY9JLbiXxnVahcTCckuls6qlaK',
  AUTH_BACKEND: 'plain',
})

const app = express()

app.set('views', `${__dirname}/views`)
app.set('view engine', 'pug')

app.use(authRouter({
  sessionKey: config.AUTH_SESSION_KEY,
  backend: config.AUTH_BACKEND,
}))

app.use((err, req, resp, next) => {
  console.log(err)
  resp.status(err.code)
  resp.send(err.message)
})

const port = config.AUTH_PORT
app.listen(port, () => {
  console.log("Config", JSON.stringify(config, null, 2))
  console.log(`Listening on port ${port}`)
})
