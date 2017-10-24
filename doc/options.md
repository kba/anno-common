# Options

## filterProps

Omit these properties in the output. Useful for reducing JSON size.

Note that props are filtered after being retrieved from the store.

## metadataOnly

Do not include the annotation body.

## includeDeleted

Include annotations that have been set to `deleted`, which would otherwise result in a `410`.

## forceDelete

Completely remove an annotation, not just set it to `delete`. 

Subsequent retrievals will result in `404` not `410`.
