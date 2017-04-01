# anno-mw-basicauth
Add HTTP Basic auth credentials to a request

## Usage

```js
// Anno is global in browser
var Anno = require('@kba/anno')
// ENV should be  'window' in browser or 'process.env' in node
ENV.ANNO_BASICAUTH_USERNAME = 'john'
ENV.ANNO_BASICAUTH_PASSWORD = 'p4ssw0rd'
var basicAuth = Anno.BasicAuthMiddleware()
var store = Anno.HttpStore()
store.use(basicAuth)
store.get(...)
```
