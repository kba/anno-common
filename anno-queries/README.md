# anno-queries

> Search and create fragments of Web Annotations

This module exposes classes for resources used as target or body
of a [Web Annotation](https://www.w3.org/TR/annotation-model).

<!-- BEGIN-MARKDOWN-TOC -->
* [API](#api)
	* [AnnoQuery](#annoquery)
		* [`new AnnoQuery(_defaultkeys=[])`](#new-annoquery_defaultkeys---)
		* [`first(anno, ...keys)`](#firstanno-keys)
		* [`all(anno, ...keys)`](#allanno-keys)
	* [textualHtmlBody](#textualhtmlbody)
		* [Example](#example)
	* [simpleTagBody](#simpletagbody)
		* [Example](#example-1)
	* [semanticTagBody](#semantictagbody)
		* [Example](#example-2)
	* [svgSelectorResource](#svgselectorresource)
		* [Example](#example-3)
	* [mediaFragmentResource](#mediafragmentresource)
	* [emptyAnnotation](#emptyannotation)

<!-- END-MARKDOWN-TOC -->

## API

<!-- BEGIN-RENDER ./queries.js -->
### AnnoQuery
Common base class of all resource classes.
#### `new AnnoQuery(_defaultkeys=[])`
- `@param Array _defaultkeys` Default path to the sub-object in question.
  Normally shoul d be either `['body']` or [`target`].
#### `first(anno, ...keys)`
Find the first resource in `anno` which matches this query.
Descend by `keys` or fall back to `this._defaultkeys`.
#### `all(anno, ...keys)`
Find the first resource in `anno` which matches this query.
Descend by `keys` or fall back to `this._defaultkeys`.
### textualHtmlBody

Find/Create bodies with included HTML content, as used in a standard text
annotation.
#### Example
```js
{
  "type": "TextualBody",
  "format": "text/html",
  "value": "<p>Some text</p>"
}
```
### simpleTagBody
Find/Create simple tag bodies. 
A simple tag body is a `TextualBody` with a `purpose` of `tagging` and a value.
#### Example
```js
{
  "type": "TextualBody",
  "purpose": "tagging",
  {
     "@context": {
         "i10nValue": { "@id": "value", "@container": "@language" }
     },
     "en": "pineapple",
     "de": "ananas"
  }
}
```
### semanticTagBody
Find/Create semantic tag bodies. 
A semantic tag body is a web resource (must have an `id`) with a `purpose`/`motivation`
of either `linking`, `identifying` or `classifying`.
#### Example
```js
{
  "id": "http://vocab/fruit17",
  "motivation": "classifying"
}
```
### svgSelectorResource
Find/create SVG selector resources.
An SVG selector is a `selector` of type `SvgSelector` with a `value` that
holds the SVG inline.
#### Example

```js
{
  "type": "SvgSelector",
  "value": "<svg>...</svg>"
}
```
### mediaFragmentResource
A `mediaFragmentResource` is a resource with a `selector` of type
`FragmentSelector` that `conformsTo` the [Media Fragment
Specs](http://www.w3.org/TR/media-frags/).
### emptyAnnotation
An empty annotation is an object that has either no `body` or no `target`.

<!-- END-RENDER -->
