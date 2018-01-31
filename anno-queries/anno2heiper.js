const {applyToAnno, ensureArray, splitIdRepliesRev} = require('@kba/anno-util')

// TODO configurable defaults
function anno2heiper(tla, doiTemplate) {
  const heiperJson = []
  applyToAnno(tla, (anno) => {
    const {_fullid} = splitIdRepliesRev(anno.id)
    const doi = doiTemplate
      .replace('{{ fullid }}', _fullid)
    // console.log({doi, _fullid})
    const internalIdentifier = _fullid
    const url = anno.id
    const creators = anno.creator && anno.creator.length
      ? anno.creator
      : tla.creator
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
      creators: creators.map(c => {return {
        displayForm: {eng: c.displayName},
        type: 'person',
      }})
    })
  }, {nestedProps: ['hasVersion']})
  return {heiperJson, anno: tla}
}

module.exports = {anno2heiper}
