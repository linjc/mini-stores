const create = require('../../node_modules/mini-stores/dist')
const helloStore = require('../../stores/helloStore')
const globalStore = require('../../stores/globalStore')

const stores = {
  '$hello': helloStore,
  '$data': globalStore
}

create.Page(stores, {

  data: {
    privateData: 'η§ζηΆζ'
  },

  onLoad() {},

  handleChangeTitle() {
    helloStore.onChangeTitle()
  },

  goBack() {
    swan.navigateBack()
  }
});
