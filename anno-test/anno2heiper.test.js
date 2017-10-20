const tap = require('tap')
const {anno2heiper} = require('@kba/anno-plugins/heiper/anno2heiper')

tap.test('anno2heiper', t => {

  const anno5 = {
    "@context": "http://www.w3.org/ns/anno.jsonld",
    "id": "http://example.org/anno5",
    "type":"Annotation",
    "modified": "2017-10-20T07:59:12+02:00",
    "creator": {
      displayName: "John Doe"
    },
    "rights": "https://creativecommons.org/publicdomain/zero/1.0/",
    "body": {
      "type" : "TextualBody",
      "value" : "<p>j'adore !</p>",
      "format" : "text/html",
      "language" : "fr"
    },
    "target": "http://example.org/photo1"
  }

  const collectionConfig = {
    doiTemplate: '10.5072/foo.{{ fullid }}'
  }
  console.log('  #  ' + JSON.stringify(anno2heiper(anno5, collectionConfig)))
  t.end()
})
