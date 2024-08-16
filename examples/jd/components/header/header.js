const helloStore = require('../../stores/helloStore')
const indexStore = require('../../stores/indexStore')
const globalStore = require('../../stores/globalStore')

Component({

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

  methods: {
    handleChangeLang() {
        console.log(this, 1111)
      globalStore.onChangeLang()
    },
  },
});
