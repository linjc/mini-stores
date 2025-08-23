const helloStore = require('../../stores/helloStore')
const globalStore = require('../../stores/globalStore')

Page({
  data: {},
  
  onLoad() {
    helloStore.bind(this, '$hello');
    globalStore.bind(this, '$data');
    globalStore.watch.on('language', console.log, this)
  },

  onShow() {
    helloStore.update()
    globalStore.update()
  },
  
  onUnload() {
    helloStore.unbind(this)
    globalStore.unbind(this)
  },

  handleChangeTitle() {
    helloStore.onChangeTitle()
  },

  goBack() {
    wx.navigateBack()
  }
});
