const helloStore = require('../../stores/helloStore')
const indexStore = require('../../stores/indexStore')
const globalStore = require('../../stores/globalStore')

Component({
  lifetimes: {
    ready() {
      helloStore.bind(this, '$hello');
      indexStore.bind(this, '$index');
      globalStore.bind(this, '$data');
    }
  },
  methods: {
    handleChangeLang() {
      globalStore.onChangeLang()
    },
  },
});
