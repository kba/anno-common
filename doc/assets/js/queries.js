/* globals Anno */
/* globals CodeMirror */
/* exported query */
/* exported loadFixture */

const inputField     = document.getElementById('input')
const resultField    = document.getElementById('result')
const queryClassList = document.getElementById('type')
const fixtureList    = document.getElementById('fixture')
const methodList     = document.getElementById('method')

function query() {
    const input = inputField.editor.getDoc().getValue()
    const anno = JSON.parse(input)
    const queryClass = queryClassList.value
    const method = methodList.value
    const result = Anno.Queries[queryClass][method](anno)
    const editor = resultField.editor
    editor.setValue(result ? JSON.stringify(result, null, 2) : '')
    editor.getScrollerElement().classList[result ? 'add' : 'remove']('success')
    editor.getScrollerElement().classList[result ? 'remove' : 'add']('error')
}

function loadFixture() {
    const [type, cat, file] = fixtureList.value.split('/')
    inputField.editor.getDoc().setValue(JSON.stringify(Anno.fixtures[type][cat][file], null, 2))
}

document.addEventListener("DOMContentLoaded", () => {

  for (let el of document.getElementsByClassName('codemirror')) {
    el.editor = CodeMirror.fromTextArea(el, {
      mode: 'application/ld+json',
      lineNumbers: true,
    })
  }

  function cmp(a, b) {
    // console.log(+/\d+/.exec(a)[0] - +/\d+/.exec(b)[0])
    return +/\d+/.exec(a) - +/\d+/.exec(b)
  }

  Object.keys(Anno.fixtures).forEach(type => {
    Object.keys(Anno.fixtures[type]).forEach(cat => {
      Object.keys(Anno.fixtures[type][cat]).sort(cmp).forEach(file => {
        const option = document.createElement('option')
        option.innerHTML = `${type}/${cat}/${file}`
        fixtureList.appendChild(option)
      })
    })
  })

  Object.keys(Anno.Queries).sort()
    .forEach(queryClass => {
      const option = document.createElement('option')
      option.innerHTML = queryClass
      queryClassList.appendChild(option)
    })

})
