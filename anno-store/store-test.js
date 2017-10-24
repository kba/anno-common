const inspect = require('@kba/anno-util/inspect')
const fixtures = require(__dirname + '/../anno-fixtures')
const toImport = {
  type: ['Annotation'],
  body: 'http://body',
  target: 'http://target',
  hasReply: [
    {type: ['Annotation'], body: {value: "Bullshit!"}, creator: "foo@bar.com"}
  ],
  hasVersion: [
    {type: ['Annotation'], body: 'http://bdoy', target: 'http://target'},
    {type: ['Annotation'], body: 'http://body', target: 'http://target'}
  ]
}

const input1 = fixtures.Annotation.ok['minimal-string-target.json']
const newTarget = 'https://foo.example.bar'
const input2 = fixtures.Annotation.ok['minimal-object-target.json']
const input3 = fixtures.Annotation.ok['minimal-array-target.json']
const input4 = {target: 'x://y', body: {type: ['oa:Tag']}}

module.exports = class StoreTests {

  constructor(store) {
    this.store = store.promisify()
  }

  async testWipe(t) {

    return t.test('wipe', async t => {
      t.plan(2)

      await this.store.wipe()
      t.ok(true, 'wipe worked')

      await this.store.init()
      t.ok(true, 'init worked')

      t.end()

    })

  }

  async testGetByRevId(t) {
    return t.test('get/revId', async t => {
      t.plan(1)
      const {store} = this

      const saved1 = await store.create(input1)
      const revId = `${saved1.id}~1`
      const byRevId = await store.get(revId)
      t.equals(byRevId.id, revId, `get by revision-id: ${revId}`)

      t.end()
    })
  }

  async testCreateGet(t) {
    return t.test('create/get', async t => {
      t.plan(7)

      const {store} = this

      const saved1 = await store.create(input1)
      t.ok(true, 'create worked')
      // t.comment(JSON.stringify(saved, null, 2))
      t.equals(saved1.target, input1.target, 'target kept (string)')

      const {id} = saved1
      const byId = await store.get(id)
      t.equals(byId.id, id, `get by url: ${id}`)
      input1.id = byId.id

      try {await store.get('DOES-NOT-EXIST')}
      catch (err) {t.equals(err.code, 404, "DOES-NOT-EXIST isnt found")}

      return Promise.all([
        store.create(input2),
        store.create(input3),
        store.create(input4),
      ]).then(([saved2, saved3, saved4]) => {
        t.equals(saved2.target.source, input2.target.source, 'target kept (object)')
        t.equals(saved3.target[0].source, input3.target[0].source, 'target kept (array of objects)')
        t.equals(saved4.target, input4.target, 'target kept (string)')

      }, () => t.end())
    })
  }

  async testSearch(t) {
    return t.test('search', async t => {
      t.plan(2)

      const {store} = this
      let annos

      await store.wipe()
      await Promise.all([input1, input2, input3, input4].map(i => store.create(i)))

      annos = await store.search()
      // console.log(annos.map(a => a.target))
      t.equals(annos.length, 4, '4 anno in store total')

      annos = await store.search({$target: input1.target})
      t.equals(annos.length, 3, `search {$target:${input1.target}} -> 3`)

      // TODO how to serialize this in a GET call?
      // cb => store.search({'target.source': {$in: [oldTarget, newTarget]}}, cb),
      // (annos, cb) => {
      //     t.equals(annos.length, 3, `search {target.source: {$in: ${JSON.stringify([oldTarget, newTarget])}}} -> 3`)
      //     cb()
      // },

      t.end()
    })
  }

  async testReply(t) {
    return t.test('reply', async t => {
      t.plan(2)
      const {store} = this

      let saved1 = await store.create(input1)
      let reply = await store.reply(saved1.id, {body: {value: 'Nonsense!'}})
      let saved2 = await store.get(saved1.id)
      t.equals(reply.id, saved1.id + '.1', 'URL has .1 added')
      t.equals(saved2.hasReply.length, 1, 'now has 1 reply')

      t.end()
    })
  }

  async testRevise(t) {
    return t.test('revise', async t => {
      t.plan(3)
      const {store} = this

      let saved1 = await store.create(input1)
      const target = newTarget
      const revised1 = await store.revise(saved1.id, Object.assign(saved1, {target}))
      const revId = `${saved1.id}~2`
      let saved2  = await store.get(saved1.id)
      t.equals(revised1.id, revId, `revised revision-id: ${revId}`)
      t.equals(revised1.target, newTarget, 'target updated')
      t.equals(saved2.hasVersion.length, 2, 'now 2 versions')

      t.end()
    })
  }

  async testDelete(t) {
    return t.test('delete', async t => {
      t.plan(7)
      const {store} = this

      await store.wipe()
      const [saved1, saved2] = await Promise.all([input1, input2, input3, input4].map(i => store.create(i)))

      let annos = await store.search()
      t.equals(annos.length, 4, '4 annos before delete')

      const found = await store.get(saved1.id)
      t.equals(found.id, saved1.id, 'still there')

      await store.delete(found.id)

      try {
        await store.get(saved1.id)
        t.fail("This one should be gone")
      } catch (err) {t.equals(err.code, 410, "get on deleted should result in 410 GONE")}

      const found410 = await store.get(saved1.id, {includeDeleted: true})
      t.ok(found410, "includeDeleted => found")

      await store.delete(saved2.id, {forceDelete: true})
      try {await store.get(saved2.id)}
      catch (err) {t.equals(err.code, 404, "Aaaand it's gone (404)")}

      annos = await store.search()
      t.equals(annos.length, 2, '2 anno after delete')

      annos = await store.search({includeDeleted: true})
      t.equals(annos.length, 3, '3 anno after delete including the one set to deleted')

      t.end()
    })
  }

  async testImport(t) {
    return t.test('import', async t => {
      const {store} = this

      let got

      got = await store.import(JSON.parse(JSON.stringify(toImport)), {slug: 'foobar3000'})
      t.equals(got.id, 'http://localhost:3000/anno/foobar3000', 'id okay')
      t.equals(got.hasVersion.length, 2, '2 versions')
      t.equals(got.hasReply.length, 1, '1 reply')
      t.equals(got.hasReply[0].hasVersion.length, 1, 'first reply has one version')

      got = await store.import(toImport, {slug: 'foobar3000'})
      t.equals(got.id, 'http://localhost:3000/anno/foobar3000', 'id STILL okay')
      t.equals(got.hasVersion.length, 2, 'STILL 2 versions')
      t.equals(got.hasReply.length, 1, 'STILL 1 reply')
      t.equals(got.hasReply[0].hasVersion.length, 1, 'first reply has STILL one version')

      t.ok(true, "testImport")
      return Promise.resolve()
    })
  }

  async testAll(t) {
    return t.test('all', async t => {
      const {store} = this
      t.plan(6)
      await store.init()
      await this.testWipe(t)
      await this.testCreateGet(t)
      await this.testGetByRevId(t)
      await this.testReply(t)
      await this.testRevise(t)
      await this.testSearch(t)
      await this.testDelete(t)
      await this.testImport(t)
      await store.disconnect()
      t.end()
    })
  }


}
