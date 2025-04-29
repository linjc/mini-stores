const helloStore = require('../../stores/helloStore')
const indexStore = require('../../stores/indexStore')
const globalStore = require('../../stores/globalStore')

Component({
  lifetimes: {
    ready() {
      helloStore.bind(this, '$hello');
      indexStore.bind(this, '$index');
      globalStore.bind(this, '$data');
    },
    detached() {
      helloStore.unbind(this)
      indexStore.unbind(this)
      globalStore.unbind(this)
    },
  },
  pageLifetimes: {
    show() {
      helloStore.update()
      indexStore.update()
      globalStore.update()
    },
  },
  methods: {
    handleChangeLang() {
      globalStore.onChangeLang()
    },
  },
});
