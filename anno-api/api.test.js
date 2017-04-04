const tap = require('tap')
const fixtures = require('@kba/anno-fixtures')

const {
    Annotation,
    TextualBody,
    TargetResource,
} = require('./api')

tap.test('validate', t => {
    t.equals(new TextualBody({type: 'TextualBody', value: '42'}).validate(), true, 'valid')
    const textualbody = new TextualBody({value: '42'})
    t.equals(textualbody.validate(), true, 'also valid')
    t.equals(textualbody.errors, null, 'hence no errors')
    const targetresource = new TargetResource()
    t.equals(targetresource.validate(), false, 'not valid')
    t.ok(targetresource.errors.length, 'hence errors')
    t.end()
})

tap.test('add / remove / numberOf', t => {
    const body = new TextualBody({})
    t.equals(typeof body.type, 'string', 'type is a string')
    t.equals(body.numberOf('type'), 1, 'so 1 type')
    body.add('type', 'Foo')
    t.ok(Array.isArray(body.type), 'type is an array after add')
    t.equals(body.numberOf('type'), 2, 'so 2 types')
    body.remove('type', 'TextualBody')
    t.equals(typeof body.type, 'string', 'type is a string after remove')
    t.equals(body.numberOf('type'), 1, 'so back to 1 type')
    t.end()
})

tap.test('find / findOne', t => {
    const anno = new Annotation(fixtures.Annotation.ok['anno41.json'])
    t.deepEquals(anno.find('body', {type: 'Choice'}), [anno.body[1]], 'find')
    t.deepEquals(anno.findOne('body', {type: 'Choice'}), anno.body[1], 'findOne')
    t.end()
})

tap.test('Annotation / findTargetsByUrl', t => {
    const annoWith2Targets = Object.keys(fixtures.Annotation.ok)
        .map(k => new Annotation(fixtures.Annotation.ok[k]))
        .find(anno => anno.numberOf('target') >= 2)
    const needle = 'http://example.org/image2'
    t.deepEquals(annoWith2Targets.findTargetsByUrl(needle), [needle], `findTargetsByUrl of ${needle}`)
    // const anno = new Annotation(fixtures.Annotation.ok['anno41.json'])
    // t.deepEquals(anno.find('body', {type: 'Choice'}), [anno.body[1]], 'find')
    // t.deepEquals(anno.findOne('body', {type: 'Choice'}), anno.body[1], 'findOne')
    t.end()
})
