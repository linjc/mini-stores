const helloStore = require('../../stores/helloStore')
const globalStore = require('../../stores/globalStore')

Page({
  data: {},
  
  onLoad() {
    helloStore.bind(this, '$hello');
    globalStore.bind(this, '$data');
  },
  
  handleChangeTitle() {
    helloStore.onChangeTitle()
  },

  goBack() {
    wx.navigateBack()
  }
});
