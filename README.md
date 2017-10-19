# anno

[![Build Status](https://travis-ci.org/kba/anno-common.svg?branch=master)](https://travis-ci.org/kba/anno-common)

Look here for the [documentation](https://kba.github.io/anno)

This monorepo contains packages that provide the building blocks for annotation
software implementing the [Web Annotation Data
Model](http://www.w3.org/TR/annotation-model/) and [Web Annotation
Protocol](http://www.w3.org/TR/annotation-protocol/).

Each repository is designed to provide a single feature to allow for broad
reuse of components.

<!-- BEGIN-MARKDOWN-TOC -->
* [Concepts](#concepts)
	* [Store](#store)
	* [Authentication](#authentication)
	* [Revisions](#revisions)
	* [Comments / Replies / Nesting](#comments--replies--nesting)
	* [URL schema](#url-schema)
	* [Extensions to Web Annotation Data Model](#extensions-to-web-annotation-data-model)
* [Hacking](#hacking)

<!-- END-MARKDOWN-TOC -->

## Concepts

### Store

A store provides persistent storage of annotations. A store exposes methods
that reflect the [Web Annotation
Protocol](http://www.w3.org/TR/annotation-protocol/) and the [extensions
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

<img src="./doc/assets/img/store-hierarchy.png" height="300" title="Hierarchy of stores"/>



### Authentication

Authentication is based on [JSON Web Tokens](https://jwt.io/).

To inspect your tokens, try [jwtinspector browser
extension](https://www.jwtinspector.io/#) which will detect JWT in HTTP traffic
and localStorage.

<img src="./doc/assets/img/authentication.png" height="400" title="Authentication flow"/>

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

### Comments / Replies / Nesting

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

### Extensions to Web Annotation Data Model

Namespace for extensions is `https://kba.github.io/anno/#`, short `annox`.

Context is at `https://anno.github.io/anno/context.jsonld`

## Hacking

Modules are managed by [lerna](https://github.com/lerna/lerna)

```
npm install -g lerna
lerna bootstrap
```

