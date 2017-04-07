# anno

This monorepo contains packages that provide the building blocks for annotation
software implementing the [Web Annotation Data
Model](http://www.w3.org/TR/annotation-model/) and [Web Annotation
Protocol](http://www.w3.org/TR/annotation-protocol/).

Each repository is designed to provide a single feature to allow for broad
reuse of components.

<!-- BEGIN-MARKDOWN-TOC -->
* [Packages](#packages)
	* [anno-cli](#anno-cli)
	* [anno-config](#anno-config)
	* [anno-schema](#anno-schema)
	* [anno-server](#anno-server)
	* [anno-store](#anno-store)
	* [anno-store-http](#anno-store-http)
	* [anno-store-mongolike](#anno-store-mongolike)
	* [anno-store-file](#anno-store-file)
	* [anno-web-plugin](#anno-web-plugin)
	* [Not implemented](#not-implemented)
* [setup](#setup)
	* [mongodb / nedb schema design](#mongodb--file-schema-design)
* [Extensions to Web Annotation Data Model](#extensions-to-web-annotation-data-model)
	* [Revisions](#revisions)
	* [Comments](#comments)
* [Misc Links](#misc-links)

<!-- END-MARKDOWN-TOC -->

## Packages

### anno-cli

Command line client

### anno-config

All configuration of all components happens via this.

### anno-schema

Schema for the different encodings and serializations

### anno-server

Express-based server implementing the Web Annotation Protocol

### anno-store

Base class for all storage.

### anno-store-http

Store that delegates its actions to a WAP server (such as anno-server)

### anno-store-mongolike

Base class for document database backends like MongoDB or NeDB.

### anno-store-file

NeDB flat file backend

### anno-web-plugin

Script for browser usage

### Not implemented

* anno-chrome-extension: Chrome extension to use browser-wide
* anno-vfs: vfs extension to allow for tag-based file systems etc.
* anno-store-sql: 

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

ID is a nice slugid, based on uuid v4 without leading dash

```
<BASE_URL>/<ID>[.r<REPLY_ID>]*[~<REVISION_ID>]
```

E.g.

* `http://localhost:3000/ewnfkjewnfew~2` Second revision
* `http://localhost:3000/ewnfkjewnfew.r2.r1~5` Fifth revision of first answer to second answer

## Misc Links

http://knexjs.org/

