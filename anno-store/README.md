# README

## API

### get

```js
get(annoIds, [options={}], cb)
```

* `annoIds`: String ID of a single annotations or an array of strings of annotations IDs
* `options`:
  * `latest`: Return the ID of the latest revision
  * `metadataOnly`: Don't return `body` and `target` of an Annotation
* `cb(err, annos)`:
  * `err`: Error if any. May contain `err.code` representing HTTP code
  * `annos`: Single Annotation of single ID was passed, array of annotations otherwise

### create

### revise

### delete

### search
