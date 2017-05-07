# anno-store

> Interface and proxy for stores

<!-- BEGIN-MARKDOWN-TOC -->
* [Proxy](#proxy)
	* [`use(middleware)`](#usemiddleware)
	* [`init(options, cb)`](#initoptions-cb)
	* [`wipe(options, callback)`](#wipeoptions-callback)
	* [`disconnect(options, callback)`](#disconnectoptions-callback)
	* [`get(annoId, options, cb)`](#getannoid-options-cb)
	* [`create(anno, options, callback)`](#createanno-options-callback)
	* [`revise(annoId, anno, options, callback)`](#reviseannoid-anno-options-callback)
	* [`delete(annoId, options, callback)`](#deleteannoid-options-callback)
	* [`remove(annoId, options, callback)`](#removeannoid-options-callback)
	* [`search(query, options, callback)`](#searchquery-options-callback)
	* [`reply(annoId, anno, options, callback)`](#replyannoid-anno-options-callback)
	* [`comment(annoId, anno, options, callback)`](#commentannoid-anno-options-callback)
	* [`aclcheck(targets, options, callback)`](#aclchecktargets-options-callback)
* [Protected API](#protected-api)
	* [`_idFromURL(url)`](#_idfromurlurl)
	* [`_urlFromId(annoId)`](#_urlfromidannoid)
	* [`_normalizeTarget(annoDoc)`](#_normalizetargetannodoc)
	* [`_normalizeType(anno)`](#_normalizetypeanno)
* [API](#api)
	* [get](#get)
	* [create](#create)
	* [revise](#revise)
	* [delete](#delete)
	* [search](#search)

<!-- END-MARKDOWN-TOC -->

## Proxy

<!-- BEGIN-RENDER ./store.js -->
### `use(middleware)`
Use middleware for auth etc.
### `init(options, cb)`
Initialize a connection to the store.
- `@param {Options} options`
- `@param {String} options.user`
- `@param {function} callback`
### `wipe(options, callback)`
Wipe the store, revisions and all.
- `@param {Options} options`
- `@param {String} options.user`
- `@param {function} callback`
### `disconnect(options, callback)`
Disconnect a store.
A disconnected store cannot be used until `init` is called again.
- `@param {Options} options`
- `@param {String} options.user`
- `@param {function} callback`
### `get(annoId, options, cb)`
Retrieve an annotation.
- `@param {String|Array<String>} annoIds`
- `@param {Options} options`
- `@param {Options} options.latest` Return the latest revision
- `@param {String} options.user`
- `@param {function} callback`
### `create(anno, options, callback)`
Create an annotation.
- `@param {Object} anno`
- `@param {Options} options`
- `@param String options.slug Proposal for the ID to create`
- `@param {String} options.user`
- `@param {function} callback`
### `revise(annoId, anno, options, callback)`
Revise an annotation.
- `@param {String} annoId`
- `@param {Object} anno`
- `@param {Options} options`
- `@param {String} options.user`
- `@param {function} callback`
### `delete(annoId, options, callback)`
### `remove(annoId, options, callback)`
Delete an annotation, i.e. set the deleted date.
- `@param {String} annoId`
- `@param {Options} options`
- `@param {Boolean} options.forceDelete` Set to `true` to hint the store to
                                     actually delete, not just mark deleted
- `@param {String} options.user`
- `@param {function} callback`
### `search(query, options, callback)`
Search the store.
- `@param {Object} query`
- `@param {Options} options`
- `@param {String} options.user`
- `@param {function} callback`
### `reply(annoId, anno, options, callback)`
### `comment(annoId, anno, options, callback)`
Reply to an annotation
- `@param {String} annoId`
- `@param {Object} anno`
- `@param {Options} options`
- `@param {String} options.user`
- `@param {function} callback`
### `aclcheck(targets, options, callback)`
- `@param {Array} targets`
- `@param {Options} options`
- `@param {function} callback`
## Protected API
These methods are available for store implementations but should not be
used by consumers.
### `_idFromURL(url)`
Get only the slug part of a URL
### `_urlFromId(annoId)`
Generate a full URL to an annotation by its id.
### `_normalizeTarget(annoDoc)`
 TODO no idempotency of targets with normalization -> disabled for now
### `_normalizeType(anno)`
Make sure `anno.type` exists, is an Array and contains `Annotation`

<!-- END-RENDER -->

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
