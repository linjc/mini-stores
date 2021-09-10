const create = require('../../node_modules/mini-stores')
const helloStore = require('../../stores/helloStore')
const globalStore = require('../../stores/globalStore')

const stores = {
  '$hello': helloStore,
  '$data': globalStore
}

create.Page(stores, {

  data: {
    privateData: '私有状态'
  },

  onLoad() {},

  handleChangeTitle() {
    helloStore.onChangeTitle()
  },

  goBack() {
    swan.navigateBack()
  }
});
