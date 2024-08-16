const helloStore = require('../../stores/helloStore')
const globalStore = require('../../stores/globalStore')

Page({

  data: {},

  onLoad() {
    helloStore.bind(this, '$hello');
    globalStore.bind(this, '$data');
  },

  onUnload() {
    helloStore.unbind(this)
    globalStore.unbind(this)
  },

  handleChangeTitle() {
    helloStore.onChangeTitle()
  },

  goBack() {
    tt.navigateBack()
  }
});
