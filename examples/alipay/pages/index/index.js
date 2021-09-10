import create from 'mini-stores'
import indexStore from '/stores/indexStore'
import globalStore from '/stores/globalStore'
console.log(create,11111111)
const stores = {
  '$index': indexStore,
  '$data': globalStore
}

create.Page(stores, {

  data: {
    privateData: '私有状态'
  },

  handleChangeTitle() {
    indexStore.data.title = '首页' + Math.floor(Math.random() * 1000)
    this.update()
  },

  goPage() {
    my.navigateTo({ url: '/pages/hello/hello' })
  }

});
