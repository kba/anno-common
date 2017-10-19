/* globals Anno */
/* globals AnnoSchema */
/* globals CodeMirror */
/* exported validate */
/* exported loadFixture */

const inputTextarea = document.getElementById('input')
const typeList = document.getElementById('type')
const fixtureList = document.getElementById('fixture')
const resultTextarea = document.getElementById('result')

function validate() {
  const validFn = AnnoSchema.validate[typeList.value]
  const editor = resultTextarea.editor
  const editorClassList = editor.getScrollerElement().classList
  try {
    const input = JSON.parse(inputTextarea.editor.getDoc().getValue())
    const valid = validFn(input)
    editorClassList[valid ? 'add' : 'remove']('success')
    editorClassList[valid ? 'remove' : 'add']('error')
    if (!valid) {
      editor.setValue(JSON.stringify(validFn.errors, null, 2))
    } else {
      editor.setValue("Valid")
    }
  } catch (err) {
    editor.setValue(err)
    editorClassList.remove('valid')
    editorClassList.add('invalid')
  }
}

function loadFixture() {
  const [type, cat, file] = fixtureList.value.split('/')
  inputTextarea.editor.getDoc().setValue(JSON.stringify(Anno.fixtures[type][cat][file], null, 2))
  typeList.value = type
}

document.addEventListener("DOMContentLoaded", () => {

  for (let el of document.getElementsByClassName('codemirror')) {
    el.editor = CodeMirror.fromTextArea(el, {
      mode: 'application/ld+json',
      lineNumbers: true,
    })
  }


  Object.keys(AnnoSchema.definitions)
    .sort((a, b) => {
      const aUC = !!a.substr(0, 1).match(/[A-Z]/)
      const bUC = !!b.substr(0, 1).match(/[A-Z]/)
      if (aUC == bUC) return a < b ? -1 : a == b ? 0 : +1
      if (aUC && !bUC) return -1
      if (!aUC && bUC) return +1
    })
    .forEach(type => {
      const option = document.createElement('option')
      option.innerHTML = type
      typeList.appendChild(option)
    })

  Object.keys(Anno.fixtures).forEach(type => {
    Object.keys(Anno.fixtures[type]).forEach(cat => {
      Object.keys(Anno.fixtures[type][cat]).forEach(file => {
        const option = document.createElement('option')
        option.innerHTML = `${type}/${cat}/${file}`
        fixtureList.appendChild(option)
      })
    })
  })

  //
  // console.log(Anno.fixtures)
  //

})
