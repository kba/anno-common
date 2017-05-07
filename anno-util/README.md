# anno-util
> Utility functions

<!-- BEGIN-MARKDOWN-TOC -->
* [`ensureArray(obj, k)`](#ensurearrayobj-k)
* [`add(obj, k, v)`](#addobj-k-v)
* [`remove(obj, k, v)`](#removeobj-k-v)
* [`numberOf(obj, k)`](#numberofobj-k)
* [`filter(needle, match)`](#filterneedle-match)
* [`find(needle, match)`](#findneedle-match)
* [`splitIdRepliesRev(str)`](#splitidrepliesrevstr)
* [`collectIds(listOfAnnotations)`](#collectidslistofannotations)

<!-- END-MARKDOWN-TOC -->

<!-- BEGIN-RENDER ./array-like.js -->
### `ensureArray(obj, k)`
Ensure that `obj[k]` is an array.

- If `obj[k]` is an array, return it.
- If `obj[k]` is not defined or `null`, return an empty array
- Otherwise return an array consisting of `[obj[k]]` only
### `add(obj, k, v)`
Add or set `obj[k]` to `v`
- If `obj[k]` is not defined or null, set `obj[k]` to `v`.
- Otherwise if `obj[k]` is an array, push `v`.
- Otherwise set `obj[k]` to an array of the old value and `v`
- If `obj[k]` is a single-value array, set `obj[k]` to this value.
### `remove(obj, k, v)`
Unset a value `v` in field `k` of `obj`.
- If `obj[k]` is an array, splice `v` out of the array
- Otherwise if `obj[k]` is equal to `v`, set `obj[k]` to an empty array.
** NOTE** Do not `delete` obj[k] to make reactive libs like Angular, Vue or
React happy.
### `numberOf(obj, k)`
Get the number of values for field `k` of `obj`.
### `filter(needle, match)`
[`Array.filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
that works on non-array single values.
### `find(needle, match)`
[`Array.find`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
that works on non-array single values.

<!-- END-RENDER -->

<!-- BEGIN-RENDER ./util.js -->
### `splitIdRepliesRev(str)`
Split a slug (last URI segment) into annotation ID, reply ID and revision ID.
### `collectIds(listOfAnnotations)`
Get a list of IDs of all annotations in a tree.
```js
collectIds([{id: 123}, {id: 'xyz', hasReply: [{id: 'foo'}]}])
// [123, 'xyz', 'foo']
```

<!-- END-RENDER -->
