const {definitions, validate} = require('@kba/anno-schema')
const sift = require('sift')

const ERRORS = Symbol('_errors')

class AnnoApiBase {

    constructor(_data) {
        for (let k in _data) this[k] = _data[k]
    }

    get errors() {
        return this[ERRORS]
    }

    validate() {
        const validFn = validate[this.constructor.name]
        const valid = validFn(this)
        this[ERRORS] = validFn.errors
        return valid
    }

    numberOf(k) {
        if (this[k] === undefined) return 0
        if (!Array.isArray(this[k])) return 1
        return this[k].length
    }

    find(k, query) {
        if (typeof k === 'object') [query, k] = [k, null]
        const needle = k ? this[k] : this
        var ret = []
        if (query === undefined) {
            ret = needle
        } else if (needle === undefined) {
            ret = []
        } else {
            const matcher = sift(query)
            if (Array.isArray(needle)) {
                ret = needle.filter(matcher)
            } else if (typeof needle === 'object') {
                ret = matcher(needle) ? [needle] : []
            } else {
                ret = []
            }
        }
        return ret
    }

    findOne(k, query) {
        const found = this.find(k, query)
        return found.length ? found[0] : null
    }

    remove(k, v) {
        if (this[k] === undefined) return
        if (!Array.isArray(this[k])) {
            if (sift(v)(this[k])) delete this[k]
        } else {
            const idx = sift(v, this[k])
            if (idx !== -1)
                this[k].splice(idx, 1)
            if (this[k].length === 1) this[k] = this[k][0]
        }
    }

    add(k, v, uniq) {
        if (this[k] === undefined) this[k] = v
        else if (!Array.isArray(this[k])) this[k] = [this[k]]
        if (uniq) {
            const idx = sift.indexOf(v, this[k])
            if (idx === -1)
                this[k].push(v)
            else
                v = this[k][idx]
        } else {
            this[k].push(v)
        }
        if (this[k].length === 1) this[k] = this[k][0]
        return v
    }

}

class TextualBody extends AnnoApiBase{

    constructor(...args) {
        super(...args)
        if (!('type' in this)) this.type = 'TextualBody'
    }

}

class TargetResource extends AnnoApiBase { }

class Annotation extends AnnoApiBase {

    constructor(...args) {
        super(...args)
        if (!('type' in this)) this.type = 'Annotation'
    }

    findTargetsByUrl(url) {
        return this.find('target', {$or: [
            url,
            {id: url},
            {source: url},
            {scope: url},
        ]})
    }

    getOrCreateBody(query, create={}) {
        var ret;
        if (!this.body) {
            ret = create
            this.body = ret
        } else {
            // const matcher = sift(query)
            // ...
            // if (this.body
            // if (matcher(
        }
    }

    getBodies(query) {
        //     if (!this.annotation.body) this.annotation.body = {type: 'TextualBody', format: 'text/html', value: ''}
        //     if (!Array.isArray(this.annotation.body)) this.annotation.body = [this.annotation.body]
        //     var ret = this.annotation.body
        //         .find(body => body.type === 'TextualBody' && body.format === 'text/html')
        //     if (!ret) {
        //         ret = {type: 'TextualBody', format: 'text/html', value: ''}
        //         this.annotation.body.push(ret)
        //     }
        //     return ret
    }

    getOrCreateHtmlBody() {
    }
}

[
    Annotation,
    TextualBody,
    TargetResource,
].forEach(cls => {
    cls.definition = definitions[cls.name]
    cls.validate = validate[cls.name]
    module.exports[cls.name] = cls
})
const x = new TextualBody({value: 42})
console.log(x.validate())
