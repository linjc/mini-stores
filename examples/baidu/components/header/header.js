const create = require('../../node_modules/mini-stores')
const helloStore = require('../../stores/helloStore')
const indexStore = require('../../stores/indexStore')
const globalStore = require('../../stores/globalStore')

const stores = {
  '$hello': helloStore,
  '$index': indexStore,
  '$data': globalStore
}

create.Component(stores, {
  methods: {
    handleChangeLang() {
      globalStore.onChangeLang()
    },
  },
});
