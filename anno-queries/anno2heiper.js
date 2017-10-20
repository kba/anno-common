const {ensureArray, splitIdRepliesRev} = require('@kba/anno-util')

function anno2heiper(anno, collectionConfig) {
  const {_fullid} = splitIdRepliesRev(anno.id)
  const doi = collectionConfig.doiTemplate
    .replace('{{ fullid }}', _fullid)
  const url = anno.id
  const ret = {
    url,
    doi,
    type: "digital_copy",
    title: {eng: anno.title},
    availability: 'download',
    place: 'internet',
    date: anno.modified,
    lang: "ger",
    license: {
      eng: {
        description: `See ${anno.rights}`,
        url: anno.rights
      }
    },
    internalIdentifier: _fullid,
    creators: ensureArray(anno, 'creator').map(c => {return {
      displayForm: {eng: c.displayName},
      type: 'person',
    }})
  }
  return ret
}

module.exports = {anno2heiper}
