const {applyToAnno, ensureArray, splitIdRepliesRev} = require('@kba/anno-util')

// TODO configurable defaults
function anno2heiper(tla, doiTemplate) {
  const heiperJson = []
  applyToAnno(tla, (anno) => {
    const {_fullid} = splitIdRepliesRev(anno.id)
    const doi = doiTemplate
      .replace('{{ fullid }}', _fullid)
    console.log({doi, _fullid})
    const internalIdentifier = _fullid
    const url = anno.id
    anno.doi = doi
    heiperJson.push({
      url,
      doi,
      internalIdentifier,
      type: "digital_copy",
      title: {eng: anno.title},
      availability: 'download',
      place: 'internet',
      date: anno.modified || new Date(),
      lang: "ger",
      license: {
        eng: {
          description: `See ${anno.rights}`,
          url: anno.rights
        }
      },
      creators: ensureArray(anno, 'creator').map(c => {return {
        displayForm: {eng: c.displayName},
        type: 'person',
      }})
    })
  })
  return {heiperJson, anno: tla}
}

module.exports = {anno2heiper}
