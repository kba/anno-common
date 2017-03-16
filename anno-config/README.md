# anno-config

Configuration using environment variables

* Get an object with uppercase keys and string values
* An option `FOO` can be overridden by setting the environment variable `ANNO_FOO`
* Modules `require`ing this can set defaults
* Environment variables that start with `ANNO_` are also set

## API

```js
loadConfig(defaults={})
```

