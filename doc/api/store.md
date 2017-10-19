# Store API
<!-- BEGIN-RENDER ./anno-store/store.js -->
## Public API
### <code><strong>static</strong> load(loadingModule)</code>
Modules may call this static method to instantiate a store from the
environment and using the packages installed in the calling package.
```js
// my-package/index.js
const store = require('@kba/anno-store').load(module)
store.init(...)
```
### `use(proc, hook='pre')`
Use processor before (`hook=pre`) or after (`hook=post`) store method.
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
### `import(anno, options, callback)`
Replaces the complete annotation with the passed annotation, not just revise it.
- `@param {Object} anno`
- `@param {Options} options`
  - `@param String options.slug Proposal for the ID to create`
  - `@param {String} options.user`
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
