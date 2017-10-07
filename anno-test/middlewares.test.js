# XXX TODO improve
process.env.ANNO_STORE = '@kba/anno-store-memory'
process.env.ANNO_STORE_MIDDLEWARES = [
  '@kba/anno-pre-user-static',
  '@kba/anno-pre-acl-static',
].join(',')

require('tap')
  .test('stuff', async t => {
    const store = require('@kba/anno-store').load({
      loadingModule: module,
      loadPlugins: require('@kba/anno-util-loaders').loadPlugins
    }).promisify()

    const asAnonymous = () => {return {}}
    const asAdmin = () => {return {user:'admin-user'}}

    await store.init(asAdmin())
    await store.wipe(asAdmin())
    await store.disconnect(asAdmin())
    await store.init(asAdmin())
    const anno = await store.create({
      id: 'http://anno1',
      body: {type:'TextualBody', value: 'foo'},
      target: {id: 'http://target1'},
    }, asAdmin())
    // console.log({anno})
    await store.search(asAnonymous())

    t.ok(true, 'passed')
    t.end()
  })
