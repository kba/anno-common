/* globals Anno */
/* globals addFixturesToSelect */

const inputField     = document.getElementById('input')
const resultField    = document.getElementById('result')
const queryClassList = document.getElementById('type')
const fixtureList    = document.getElementById('fixture')
const methodList     = document.getElementById('method')

function query() {
    const input = inputField.editor.getDoc().getValue()
    console.log('x', input)
    const anno = JSON.parse(input)
    const queryClass = queryClassList.value
    const method = methodList.value
    const result = Anno.Queries[queryClass][method](anno)
    resultField.classList[result ? 'add' : 'remove']('success')
    resultField.classList[result ? 'remove' : 'add']('error')
    resultField.innerHTML = JSON.stringify(result, null, 2)
}

function loadFixture() {
    const [type, cat, file] = fixtureList.value.split('/')
    inputField.editor.getDoc().setValue(JSON.stringify(Anno.fixtures[type][cat][file], null, 2))
}

addFixturesToSelect(fixtureList)

Object.keys(Anno.Queries).sort()
    .forEach(queryClass => {
        const option = document.createElement('option')
        option.innerHTML = queryClass
        queryClassList.appendChild(option)
    })
