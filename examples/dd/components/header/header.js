import helloStore from '/stores/helloStore'
import indexStore from '/stores/indexStore'
import globalStore from '/stores/globalStore'

Component({
  didMount() {
    helloStore.bind(this, '$hello');
    indexStore.bind(this, '$index');
    globalStore.bind(this, '$data');
  },
  methods: {
    handleChangeLang() {
      globalStore.onChangeLang()
    },
  },
});
