# Options

## skipVersions

Return only the top-level annotation.

## skipReplies

Do not include replies with an annotation.

## metadataOnly

Do not include the annotation body.

## includeDeleted

Include annotations that have been set to `deleted`, which would otherwise result in a `410`.

## forceDelete

Completely remove an annotation, not just set it to `delete`. 

Subsequent retrievals will result in `404` not `410`.
