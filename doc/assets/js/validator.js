/* globals Anno */
/* globals CodeMirror */
/* exported validate */
/* exported loadFixture */

const input = document.getElementById('input')
const typeList = document.getElementById('type')
const fixtureList = document.getElementById('fixture')
const result = document.getElementById('result')

function validate() {
  const validFn = Anno.Schema.validate[typeList.value]
  try {
    const valid = validFn(JSON.parse(input.editor.getDoc().getValue()))
    result.classList[valid ? 'add' : 'remove']('success')
    result.classList[valid ? 'remove' : 'add']('error')
    if (!valid) {
      result.innerHTML = JSON.stringify(validFn.errors, null, 2)
    } else {
      result.innerHTML = "Valid"
    }
  } catch (err) {
    result.innerHTML = err
    result.classList.remove('valid')
    result.classList.add('invalid')
  }
}

function loadFixture() {
  const [type, cat, file] = fixtureList.value.split('/')
  input.editor.getDoc().setValue(JSON.stringify(Anno.fixtures[type][cat][file], null, 2))
  typeList.value = type
}

document.addEventListener("DOMContentLoaded", () => {

  for (let el of document.getElementsByClassName('codemirror')) {
    el.editor = CodeMirror.fromTextArea(el, {
      mode: 'application/ld+json',
      lineNumbers: true,
    })
  }


  Object.keys(Anno.Schema.definitions)
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
