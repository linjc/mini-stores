const indexStore = require('../../stores/indexStore')
const globalStore = require('../../stores/globalStore')

Page({

  data: {
    privateData: '私有状态'
  },

  onLoad() {
    indexStore.bind(this, '$index');
    globalStore.bind(this, '$data');
    globalStore.watch.on('language', console.log, this)
  },

  onUnload() {
    helloStore.unbind(this)
    globalStore.unbind(this)
  },

  handleChangeTitle() {
    indexStore.data.title = '首页' + Math.floor(Math.random() * 1000)
  },

  goPage() {
    swan.navigateTo({ url: '/pages/hello/hello' })
  }

});
