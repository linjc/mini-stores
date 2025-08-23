const indexStore = require('../../stores/indexStore')
const globalStore = require('../../stores/globalStore');

Page({

  data: {
    privateData: '私有状态'
  },

  onLoad() {
    indexStore.bind(this, '$index');
    globalStore.bind(this, '$data');
    globalStore.watch.on('language', this.onWatchLang)
  },

  onShow() {
    indexStore.update()
    globalStore.update()
  },

  onUnload() {
    indexStore.unbind(this)
    globalStore.unbind(this)
    globalStore.watch.off('language', this.onWatchLang)
  },

  onWatchLang(value, oldValue) {
    console.log('language change:', value, oldValue)
  },
  
  handleChangeTitle() {
    indexStore.data.title = '首页' + Math.floor(Math.random() * 1000)
    indexStore.update()
  },

  goPage() {
    wx.navigateTo({ url: '/pages/hello/hello' })
  }

});
