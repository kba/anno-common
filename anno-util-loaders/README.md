# anno-util-loaders

> Wrappers to configure processors

```js
class myprocessor {
  constructor(data) {
    this.data = data
  }
}
const {StaticLoader,ConfigReloader} = require('@kba/anno-util-loaders')
process.env.ANNO_MYPROC_FILE='/path/to/config.json'
const myprocessorFromFile = ConfigReloader(myprocessor, 'MYPROC_FILE')
const proc = myprocessorFromFile()
// proc will be initialized once with the data parsed from '/path/to/config.json' and
// re-initialized whenever the configuration file changes

```

## `StaticLoader(processorClass, envyconfVar, defaultValue='')`

Load configuration once by parsing the contents of the config variable as JSON.
Fall back to `defaultValue`.

## `ConfigReloader(processorClass, envyconfVar)`

Load configuration once from a file and then for every change again.
