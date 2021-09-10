import create from 'mini-stores'
import helloStore from '/stores/helloStore'
import indexStore from '/stores/indexStore'
import globalStore from '/stores/globalStore'

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
