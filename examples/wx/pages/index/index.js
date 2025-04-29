const indexStore = require('../../stores/indexStore')
const globalStore = require('../../stores/globalStore');

Page({

  data: {
    privateData: '私有状态'
  },

  onLoad() {
    indexStore.bind(this, '$index');
    globalStore.bind(this, '$data');
  },

  onShow() {
    indexStore.update()
    globalStore.update()
  },

  onUnload() {
    indexStore.unbind(this)
    globalStore.unbind(this)
  },
  
  handleChangeTitle() {
    indexStore.data.title = '首页' + Math.floor(Math.random() * 1000)
    indexStore.update()
  },

  goPage() {
    wx.navigateTo({ url: '/pages/hello/hello' })
  }

});
