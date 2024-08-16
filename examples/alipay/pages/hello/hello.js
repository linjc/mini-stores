import helloStore from '/stores/helloStore'
import globalStore from '/stores/globalStore'

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
    my.navigateBack()
  }
});
