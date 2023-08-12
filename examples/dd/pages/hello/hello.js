import helloStore from '/stores/helloStore'
import globalStore from '/stores/globalStore'

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
    dd.navigateBack()
  }
});
