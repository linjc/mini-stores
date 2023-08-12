const create = require('mini-stores')

class Store extends create.Store {
  
  data = {
    title: 'Hello页',
  }

  onChangeTitle() {
    this.data.title = 'Hello页' + Math.floor(Math.random() * 1000)
    this.update()
  }

}

module.exports = new Store();