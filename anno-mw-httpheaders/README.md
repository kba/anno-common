# anno-mw-httpheaders
Add custom HTTP headers

## Usage

```js
// Anno is global in browser
var Anno = require('@kba/anno')
// ENV should be  'window' in browser or 'process.env' in node
ENV.ANNO_HTTPHEADERS = 'Authorization: Bearer MY-TOKEN|X-Custom-Header: Some value'
var httpHeaders = Anno.HttpHeaderMiddleware()
var store = new Anno.HttpStore()
store.use(httpHeaders)
store.get(...)
```

## Config

* `HTTPHEADER`: Headers separated by `|` or newline
