const create = require('../../node_modules/mini-stores/dist')
const indexStore = require('../../stores/indexStore')
const globalStore = require('../../stores/globalStore')

const stores = {
  '$index': indexStore,
  '$data': globalStore
}

create.Page(stores, {

  data: {
    privateData: '私有状态'
  },

  handleChangeTitle() {
    indexStore.data.title = '首页' + Math.floor(Math.random() * 1000)
    this.update()
  },

  goPage() {
    swan.navigateTo({ url: '/pages/hello/hello' })
  }

});
