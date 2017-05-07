# anno-store

> Interface for stores

<!-- BEGIN-MARKDOWN-TOC -->
* [Implementing a store](#implementing-a-store)
* [Public API](#public-api)
	* [<code><strong>static</strong> load(loadingModule)</code>](#static-loadloadingmodule)
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
	* [`deleteId(anno)`](#deleteidanno)
	* [`_genid(slug='')`](#_genidslug---)

<!-- END-MARKDOWN-TOC -->

## Implementing a store

To implement a store, override the [Public API](#public-api) with this convention:

* Prepend and underscore to the method name
* Method takes exactly two parameters: `context` and `callback`
* All positional parameters become keys in the `context` object

For example to override the `create(anno, options, callback)` method:

```js
// my-store/index.js
class MyStore extends require('@kba/anno-store') {
  
  _create(options, callback) {
    const anno = options.anno
    // ...
    return callback(...)
  }
}
```

<!-- BEGIN-RENDER ./store.js -->
## Public API
### <code><strong>static</strong> load(loadingModule)</code>
Modules may call this static method to instantiate a store from the
environment and using the packages installed in the calling package.
```js
// my-package/index.js
const store = require('@kba/anno-store').load(module)
store.init(...)
```
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
- `@param {Object} options`
    - `@param {Boolean} options.latest` Return the latest revision only
    - `@param {Boolean} options.metadataOnly` Return only metadata
    - `@param {Boolean} options.skipVersions` Omit versions
    - `@param {Boolean} options.skipReplies` Omit replies
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
### `deleteId(anno)`
Delete the `id` and store it in `via`.
- `@param Object anno`
### `_genid(slug='')`
Generate an ID for the annotation from `slug` and a ["nice"
slugid](https://www.npmjs.com/package/slugid)

<!-- END-RENDER -->
