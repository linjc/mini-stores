import indexStore from '/stores/indexStore'
import globalStore from '/stores/globalStore'

Page({

  data: {
    privateData: '私有状态'
  },

  onLoad() {
    indexStore.bind(this, '$index');
    globalStore.bind(this, '$data');
  },

  onUnload() {
    helloStore.unbind(this)
    globalStore.unbind(this)
  },

  handleChangeTitle() {
    indexStore.data.title = '首页' + Math.floor(Math.random() * 1000)
    indexStore.update()
  },

  goPage() {
    my.navigateTo({ url: '/pages/hello/hello' })
  }

});
