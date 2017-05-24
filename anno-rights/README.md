# anno-rights

> Rights management for anno store (users and rules)

<!-- BEGIN-MARKDOWN-TOC -->
<!-- END-MARKDOWN-TOC -->

## ACL Users

* `role`: An optional global role of a user
* `id`: The user ID such as their homepage or email address
* `perm`: An array of objects of collection-specific roles
  * `collection`: The collection these roles apply to
  * `role`: The roles

## ACL Rules

Rules for authorization are expressed as
[sift-rule](https://github.com/kba/sift-rule) rules and read as JSON from the
environment variable `ANNO_ACL_DATA`.

Rules are an ordered list of `CONDITION`-`RESULT`-`DESCRIPTION` triplets:

* `CONDITION` is a sift query on an object encoding the request context
  * `method`: One of the methods of [anno-store](https://github.com/kba/anno/tree/master/anno-store)
  * `anno`: The existing annotation
    * See [data-model.yml in anno-schema](https://github.com/kba/anno/tree/master/anno-schema/data-model.yml)
  * `newAnno`: The new annotation (in case of `create`, `revise`)
  * `user`: The user calling the method, see [ACL Users](#acl-users)
  * `collection`: ID of the collection in question. Defaults to `default`
* `RESULT` is `true` to allow or `false` to deny the request
* `DESCRIPTION` is an optional description of the rule

<!-- BEGIN-RENDER ./rights.js -->
<!-- END-RENDER -->
