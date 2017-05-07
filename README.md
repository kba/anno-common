# anno

This monorepo contains packages that provide the building blocks for annotation
software implementing the [Web Annotation Data
Model](http://www.w3.org/TR/annotation-model/) and [Web Annotation
Protocol](http://www.w3.org/TR/annotation-protocol/).

Each repository is designed to provide a single feature to allow for broad
reuse of components.

<!-- BEGIN-MARKDOWN-TOC -->
* [Concepts](#concepts)
	* [Store](#store)
	* [Middleware](#middleware)
* [Packages](#packages)
* [setup](#setup)
	* [mongodb / nedb schema design](#mongodb--nedb-schema-design)
* [Extensions to Web Annotation Data Model](#extensions-to-web-annotation-data-model)
	* [Revisions](#revisions)
	* [Comments](#comments)
	* [URL schema](#url-schema)
* [Misc Links](#misc-links)

<!-- END-MARKDOWN-TOC -->

## Concepts

### Store

A store provides persistent storage of annotations. A store exposes methods
that reflect the [Web Annotation
Protocol](http://www.w3.org/TR/annotation-protocol/)and the [extensions
implemented of this framework](#extensions-to-web-annotation-data-model).

The [`store`](./anno-store) module is a
[proxy](https://en.wikipedia.org/wiki/Proxy_pattern) to the actual
implementation. It handles method dispatch and middleware and allows
instantiation from the environemnt. Actual stores must implement [its
interface](./store/README.md#interface).

The [`store-mongolike`](./anno-store-mongolike) module implements most of the
[`store` interface ](./anno-store/README.md#interface) for document databases,
such as [mongodb](https://mongodb.com) or
[NeDB](https://github.com/louischatriot/nedb).

<img src="./doc/store-hierarchy.png" height="300" title="Hierarchy of stores"/>

### Middleware

When the method of a store is invoked, a **context** is created. The context is
just an object with the method parameters, such as the new annotation in the
case of `create` or the lookup ID in the case of `get`.

Before the method is actually dispatched, middleware can be injected to act
upon the context, modify it or cancel the operation. The mechanism is similar
to middleware in HTTP frameworks such as Express or Plack. Use cases for
middleware include:

* Validation: Detect invalid arguments for an operation
* Authentication: Inject a user id from a session into the context
* User lookup: Provide user details from an external data source, such as the
  display name.
* Authorization: Determine whether the calling user is allowed this operation.

## Packages

<!-- BEGIN-EVAL ls -d anno-* | sed -e 's,\(.*\)$,- [\1](./\1),' -->
- [anno-acl](./anno-acl)
- [anno-cli](./anno-cli)
- [anno-errors](./anno-errors)
- [anno-fixtures](./anno-fixtures)
- [anno-mw-acl-static](./anno-mw-acl-static)
- [anno-mw-user-static](./anno-mw-user-static)
- [anno-queries](./anno-queries)
- [anno-schema](./anno-schema)
- [anno-server](./anno-server)
- [anno-store](./anno-store)
- [anno-store-file](./anno-store-file)
- [anno-store-http](./anno-store-http)
- [anno-store-memory](./anno-store-memory)
- [anno-store-mongodb](./anno-store-mongodb)
- [anno-store-mongolike](./anno-store-mongolike)
- [anno-test](./anno-test)
- [anno-util](./anno-util)
- [anno-vue](./anno-vue)
- [anno-webpack](./anno-webpack)

<!-- END-EVAL -->

## setup

```
npm install -g lerna
lerna bootstrap
```

### mongodb / nedb schema design

## Extensions to Web Annotation Data Model

Namespace for extensions is `https://kba.github.io/anno/#`, short `annox`.

Context is at `https://anno.github.io/anno/context.jsonld`

### Revisions

An `oa:Annotation` has `1..n` `annox:hasVersion` `annox:AnnotationRevision`.

`annox:hasVersion` is an ordered List.

The top-level `oa:Annotation` has the data from the latest revision as

* `body`
* `target`
* `creator`

The `modified` of the top-level `oa:Annotation` is the `created` of the latest
revision.

`hasVersion` is part of the
[`getMetadata`](https://github.com/kba/anno/tree/master/anno-store/#getmetadata)
store call/`HEAD` HTTP call.

### Comments

### URL schema

ID is a [nice slugid](https://www.npmjs.com/package/slugid), based on uuid v4
without leading dash

```
<BASE_URL>/<ID>[.<REPLY_ID>]*[~<REVISION_ID>]
```

E.g.

* `http://localhost:3000/ewnfkjewnfew~2` Second revision
* `http://localhost:3000/ewnfkjewnfew.2.1~5` Fifth revision of first answer to second answer

Replies reply to the generic not versioned annotation (for sanity)

## Misc Links

http://knexjs.org/

