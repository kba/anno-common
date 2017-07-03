const {find, filter, numberOf} = require('@kba/anno-util')
const prune = require('object-prune')

/**
 * ### AnnoQuery
 *
 * Common base class of all resource classes.
 */
class AnnoQuery {

    /**
     * #### `new AnnoQuery(_defaultkeys=[])`
     *
     * - `@param Array _defaultkeys` Default path to the sub-object in question.
     *   Normally shoul d be either `['body']` or [`target`].
     */
    constructor(_defaultkeys=[]) {
        this._defaultkeys = _defaultkeys
    }

    /**
     * #### `first(anno, ...keys)`
     *
     * Find the first resource in `anno` which matches this query.
     *
     * Descend by `keys` or fall back to `this._defaultkeys`.
     */
    first(obj, ...keys) {
        if (keys.length === 0) keys = this._defaultkeys
        for (let k of keys) obj = obj[k]
        return find(obj, this.match)
    }

    /**
     * #### `all(anno, ...keys)`
     *
     * Find the first resource in `anno` which matches this query.
     *
     * Descend by `keys` or fall back to `this._defaultkeys`.
     */
    all(obj, ...keys) {
        if (keys.length === 0) keys = this._defaultkeys
        for (let k of keys) obj = obj[k]
        return filter(obj, this.match)
    }

}

/**
 * ### textualHtmlBody
 * 
 * Find/Create bodies with included HTML content, as used in a standard text
 * annotation.
 *
 * #### Example
 *
 * ```js
 * {
 *   "type": "TextualBody",
 *   "format": "text/html",
 *   "value": "<p>Some text</p>"
 * }
 * ```
 */
class textualHtmlBody extends AnnoQuery {
    match(body) {
        return (
            body &&
            body.type === 'TextualBody' &&
            body.format === 'text/html'
        )
    }
    create({value=''}={}) {
        return {
            type: 'TextualBody',
            format: 'text/html',
            value: '',
        }
    }
}

/**
 * ### simpleTagBody
 *
 * Find/Create simple tag bodies. 
 *
 * A simple tag body is a `TextualBody` with a `purpose` of `tagging` and a value.
 *
 * #### Example
 *
 * ```js
 * {
 *   "type": "TextualBody",
 *   "purpose": "tagging",
 *   {
 *      "@context": {
 *          "i10nValue": { "@id": "value", "@container": "@language" }
 *      },
 *      "en": "pineapple",
 *      "de": "ananas"
 *   }
 * }
 * ```
 */
class simpleTagBody extends AnnoQuery {
    match(body) {
        return body && (
            body.motivation === 'tagging' || body.purpose === 'tagging'
        )
    }
    create(i10nValue={en: ''}) {
        return {
            "@context": {
                "i10nValue": { "@id": "value", "@container": "@language" }
            },
            type: 'TextualBody',
            purpose: 'tagging',
            i10nValue,
        }
    }
}


/**
 * ### semanticTagBody
 *
 * Find/Create semantic tag bodies. 
 *
 * A semantic tag body is a web resource (must have an `id`) with the sole purpose
 * of `classifying`.
 *
 * #### Example
 *
 * ```js
 * {
 *   "id": "http://vocab/fruit17",
 *   "purpose": "classifying"
 * }
 * ```
 */
class semanticTagBody extends AnnoQuery {
    match(body) {
        return (
            body && body.purpose === 'classifying'
        )
    }
    create(tpl={}) {
        return Object.assign({
            purpose: 'classifying',
            source: '',
        }, tpl)
    }
}

/**
 * ### relationLinkBody
 *
 * Find/Create qualified links to other web resources
 *
 * A semantic tag body is a web resource (must have an `id`) that is related to the
 * target of the annotation by the relation in its 'predicate'.
 *
 * Always has a purpose of 'linking'.
 *
 * #### Example
 *
 * ```js
 * {
 *   "id": "http://example.org/work1",
 *   "purpose": "linking",
 *   "predicate": "http://purl.org/dcterms/partOf",
 * }
 * ```
 */
class relationLinkBody extends AnnoQuery {
    match(body) {
        return (
            body
            && body.purpose === 'linking'
            && 'predicate' in body
        )
    }
    create(tpl={}) {
        return Object.assign({
            purpose: 'linking',
            predicate: '',
            source: '',
        }, tpl)
    }
}

/**
 * ### svgSelectorResource
 *
 * Find/create SVG selector resources.
 *
 * An SVG selector is a `selector` of type `SvgSelector` with a `value` that
 * holds the SVG inline.
 *
 * #### Example
 * 
 * ```js
 * {
 *   "type": "SvgSelector",
 *   "value": "<svg>...</svg>"
 * }
 * ```
 */
class svgSelectorResource extends AnnoQuery {
    match(target) {
        return (
            target &&
            target.selector &&
            target.selector.type === 'SvgSelector'
        )
    }
    create({value=''}={}) {
        return {
            selector: {
                type: 'SvgSelector',
                value: value
            }
        }
    }
}

/**
 * ### mediaFragmentResource
 *
 * A `mediaFragmentResource` is a resource with a `selector` of type
 * `FragmentSelector` that `conformsTo` the [Media Fragment
 * Specs](http://www.w3.org/TR/media-frags/).
 */
class mediaFragmentResource extends AnnoQuery {

    match(target) {
        return (
            target &&
            target.selector &&
            target.selector.type === 'FragmentSelector' &&
            target.selector.conformsTo === 'http://www.w3.org/TR/media-frags/'
        )
    }

    create({value='',id}={}) {
        return {
            selector: {
                type: 'FragmentSelector',
                conformsTo: "http://www.w3.org/TR/media-frags/",
                value: value,
            }
        }
    }
}

/**
 * ### emptyAnnotation
 *
 * An empty annotation is an object that has either no `body` or no `target`.
 */
class emptyAnnotation extends AnnoQuery {

    match(anno) {
        return numberOf(anno, 'target') === 0 || numberOf(anno, 'body') === 0
    }

    create({body, target, id, type='Annotation'}={}) {
        return {type, target, body, id}
    }
}

/**
 * ### targetId
 *
 * Guess the URL of the thing that is to be annotated
 */
function _targetId(target) {
    return target.scope || target.source || target.id
}
function targetId(anno) {
    if (!anno.target)
        return;
    if (typeof anno.target === 'string')
        return anno.target
    else if (Array.isArray(anno.target))
        return anno.target.find(_targetId)
    else
        return _targetId(anno.target)
}


module.exports = {
    emptyAnnotation:       new emptyAnnotation(),

    textualHtmlBody:       new textualHtmlBody(['body']),
    simpleTagBody:         new simpleTagBody(['body']),
    semanticTagBody:       new semanticTagBody(['body']),
    relationLinkBody:      new relationLinkBody(['body']),

    svgSelectorResource:   new svgSelectorResource(['target']),
    mediaFragmentResource: new mediaFragmentResource(['body']),

    targetId

}

