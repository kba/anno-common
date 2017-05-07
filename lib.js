/* globals Anno */
function addFixturesToSelect(fixtureList) {
    Object.keys(Anno.fixtures).forEach(type => {
        Object.keys(Anno.fixtures[type]).forEach(cat => {
            Object.keys(Anno.fixtures[type][cat]).forEach(file => {
                const option = document.createElement('option')
                option.innerHTML = `${type}/${cat}/${file}`
                fixtureList.appendChild(option)
            })
        })
    })
}
