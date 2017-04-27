const {find, filter, numberOf} = require('@kba/anno-util')
const prune = require('object-prune')

class AnnoQuery {

    constructor(_defaultkeys=[]) {
        this._defaultkeys = _defaultkeys
    }

    first(obj, ...keys) {
        if (keys.length === 0) keys = this._defaultkeys
        for (let k of keys) obj = obj[k]
        return find(obj, this.match)
    }

    all(obj, ...keys) {
        if (keys.length === 0) keys = this._defaultkeys
        for (let k of keys) obj = obj[k]
        return filter(obj, this.match)
    }

}

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

class simpleTagBody extends AnnoQuery {
    match(body) {
        return body && (
            body.motivation === 'tagging' || body.purpose === 'tagging'
        )
    }
    create({value={'@value': '', "@language": 'de'}}={}) {
        return {
            type: 'TextualBody',
            purpose: 'tagging',
            value
        }
    }
}

class semanticTagBody extends AnnoQuery {
    match(body) {
        return (
            body && (
                body.motivation === 'linking'     || body.purpose === 'linking'     ||
                body.motivation === 'identifying' || body.purpose === 'identifying' ||
                body.motivation === 'classifying' || body.purpose === 'classifying'
            )
        )
    }
    create({id=''}={}) {
        return {
            purpose: 'linking',
            id,
        }
    }
}

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

class emptyAnnotation extends AnnoQuery {

    match(anno) {
        return numberOf(anno, 'target') === 0 || numberOf(anno, 'body') === 0
    }

    create({body, target, id, type='Annotation'}={}) {
        return {type, target, body, id}
    }
}


module.exports = {
    emptyAnnotation:       new emptyAnnotation(),

    textualHtmlBody:       new textualHtmlBody(['body']),
    simpleTagBody:         new simpleTagBody(['body']),
    semanticTagBody:       new semanticTagBody(['body']),

    svgSelectorResource:   new svgSelectorResource(['target']),
    mediaFragmentResource: new mediaFragmentResource(['body']),

}

