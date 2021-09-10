const create = require('mini-stores')
const helloStore = require('../../stores/helloStore')
const globalStore = require('../../stores/globalStore')

const stores = {
  '$hello': helloStore,
  '$data': globalStore
}

create.Page(stores, {

  data: {},

  onLoad() { },
  
  handleChangeTitle() {
    helloStore.onChangeTitle()
  },

  goBack() {
    tt.navigateBack()
  }
});
