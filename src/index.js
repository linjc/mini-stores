const TYPE_ARRAY = '[object Array]'
const TYPE_OBJECT = '[object Object]'
const TYPE_FUNCTION = '[object Function]'
const __Page = Page
const __Component = Component
const instances = {}
let updateName = 'update'

function setUpdateName(name) {
  updateName = name || updateName
}

function initStores(stores, option) {
  option.data = option.data || {}
  Object.keys(stores || {}).forEach(key => {
    const store = stores[key]
    store.data = store.data || {}
    store[updateName] = updateState
    if (!store.__isReadyComputed) {
      setComputed(store.data, store.data)
      store.__isReadyComputed = true
    }
    option.data[key] = deepCopy(store.data)
  })
}

function createPage(stores, option) {
  if (!option) {
    console.error('createPage参数有误')
    option = stores || {}
    stores = {}
  }
  initStores(stores, option)

  const onLoad = option.onLoad
  option.onLoad = function (query) {
    const vmRoute = getVmRoute(this);
    instances[vmRoute] = instances[vmRoute] || []
    Object.keys(stores).forEach(key => instances[vmRoute].push({ key, vm: this, store: stores[key] }))
    this[updateName] = () => updateState(vmRoute)
    onLoad && onLoad.call(this, query)
  }

  const onShow = option.onShow
  option.onShow = function (query) {
    this[updateName]()
    onShow && onShow.call(this, query)
  }

  const onUnload = option.onUnload
  option.onUnload = function (query) {
    onUnload && onUnload.call(this, query)
    const vmRoute = getVmRoute(this);
    instances[vmRoute].length = 0
  }

  __Page(option)
}

function createComponent(stores, option) {
  if (!option) {
    console.error('createComponent参数有误')
    option = stores || {}
    stores = {}
  }
  initStores(stores, option)

  function initReady(config, key, onOldReady) {
    const onReady = config[key]
    config[key] = function (query) {
      this.$page = this.$page || this.pageinstance || getNowPage()
      const vmRoute = getVmRoute(this);
      instances[vmRoute] = instances[vmRoute] || []
      Object.keys(stores).forEach(key => instances[vmRoute].push({ key, vm: this, store: stores[key] }))
      this[updateName] = () => updateState(vmRoute)
      this[updateName](vmRoute)
      if (onReady) {
        onReady.call(this, query)
      } else if (onOldReady) {
        onOldReady.call(this, query)
      }
    }
  }

  function initDestroy(config, key, onOldDestroy) {
    const onDestroy = config[key]
    config[key] = function (query) {
      const vmRoute = getVmRoute(this);
      if (onDestroy) {
        onDestroy.call(this, query)
      } else if (onOldDestroy) {
        onOldDestroy.call(this, query)
      }
      instances[vmRoute] = instances[vmRoute].filter(f => f.vm !== this)
    }
  }

  // 钉钉/支付宝等阿里系小程序
  initReady(option, 'didMount')
  initDestroy(option, 'didUnmount')

  // 微信/京东/百度/字节/QQ等小程序
  option.lifetimes = option.lifetimes || {}
  initReady(option.lifetimes, 'ready', option.ready)
  initDestroy(option.lifetimes, 'detached', option.detached)

  __Component(option)
}

function setComputed(storeData, value, obj, key) {
  const type = getType(value)
  if (type === TYPE_FUNCTION) {
    Object.defineProperty(obj, key, {
      enumerable: true,
      get: function () {
        return value.call(storeData)
      },
      set: function () {
        console.warn('计算属性不支持重新赋值')
      }
    })
  } else if (type === TYPE_OBJECT) {
    Object.keys(value).forEach(subKey => {
      setComputed(storeData, value[subKey], value, subKey)
    })
  } else if (type === TYPE_ARRAY) {
    value.forEach((item, index) => {
      setComputed(storeData, item, value, index)
    })
  }
}

function deepCopy(data) {
  const type = getType(data)
  if (type === TYPE_OBJECT) {
    const obj = {}
    Object.keys(data).forEach(key => obj[key] = deepCopy(data[key]))
    return obj
  }
  if (type === TYPE_ARRAY) {
    return data.map(deepCopy)
  }
  return data
}

function getNowPage() {
  const pages = getCurrentPages()
  return pages[pages.length - 1]
}

function updateState(vmRoute) {
  const vms = instances[vmRoute] || instances[getVmRoute(getNowPage())] || []
  return Promise.all(vms.map(f => setState(f.vm, { [f.key]: f.store.data })))
}

function setState(vm, data) {
  vm._new_data = vm._new_data || {}
  Object.assign(vm._new_data, data)
  return new Promise(resolve => {
    Promise.resolve().then(() => {
      if (vm._new_data) {
        const diffState = getDiffState(vm._new_data, vm.data)
        vm._new_data = null
        vm.setData(diffState, resolve)
      } else {
        resolve()
      }
    })
  })
}

function getDiffState(state, preState) {
  const newState = {}
  stateDiff(deepCopy(state), preState, '', newState)
  return newState
}

function getType(obj) {
  return Object.prototype.toString.call(obj)
}

function addDiffState(newState, key, val) {
  key !== '' && (newState[key] = val)
}

function stateDiff(state, preState, path, newState) {
  if (state === preState) return
  const stateType = getType(state)
  const preStateType = getType(preState)
  if (stateType === TYPE_OBJECT) {
    const stateKeys = Object.keys(state)
    const preStateKeys = Object.keys(preState || {})
    const stateLen = stateKeys.length
    const preStateLen = preStateKeys.length
    if (path !== '') {
      if (preStateType !== TYPE_OBJECT || stateLen < preStateLen || stateLen === 0 || preStateLen === 0) {
        addDiffState(newState, path, state)
        return
      }
      preStateKeys.forEach(key => {
        if (state[key] === undefined) {
          state[key] = null // 已删除的属性设置为null
          stateKeys.indexOf(key) === -1 && stateKeys.push(key)
        }
      })
    }
    stateKeys.forEach(key => {
      const subPath = path === '' ? key : path + '.' + key
      stateDiff(state[key], preState[key], subPath, newState)
    })
    return
  }
  if (stateType === TYPE_ARRAY) {
    if (preStateType !== TYPE_ARRAY || state.length < preState.length || state.length === 0 || preState.length === 0) {
      addDiffState(newState, path, state)
      return
    }
    preState.forEach((item, index) => {
      state[index] === undefined && (state[index] = null) // 已删除的属性设置为null
    })
    state.forEach((item, index) => stateDiff(item, preState[index], path + '[' + index + ']', newState))
    return
  }
  addDiffState(newState, path, state)
}

function getVmRoute(vm) {
  return vm.route;
}

function getCurrentRoutes() {
  return getCurrentPages().map(f => getVmRoute(f));
}

function initComponent(vm) {
  if (vm.route) return;
  const pageVm = vm.$page || vm.pageinstance || getNowPage() || {};
  vm.route = pageVm.route;
}

class Store {
  constructor() {
    setTimeout(() => {
      this._setComputed()
    }, 0)
  }

  _setComputed() {
    if (!this.__isReadyComputed) {
      this.__isReadyComputed = true;
      setComputed(this.data, this.data);
    }
  }

  bind(vm, key) {
    if (!key) {
      console.error(`请设置store在当前组件实例data中的key，如store.bind(this, '$store')`);
      return;
    }
    vm.data = vm.data || {}
    vm.data[key] = null;
    this.__vms = this.__vms || [];
    this._setComputed();
    this.__vms.push({ vm, key });
    setState(vm, { [key]: this.data });
    setTimeout(() => initComponent(vm), 360);
  }

  unbind(vm) {
    this.__vms = this.__vms.filter(f => f.vm !== vm);
  }

  update() {
    const currRoutes = getCurrentRoutes();
    const nowVmRoute = currRoutes[currRoutes.length - 1];
    const delayVms = [];
    this.__vms = this.__vms.filter(f => {
      const vmRoute = getVmRoute(f.vm);
      if (currRoutes.includes(vmRoute)) {
        if (nowVmRoute === vmRoute) {
          setState(f.vm, { [f.key]: this.data });
        } else { // 延迟更新
          delayVms.push(f);
        }
        return true;
      }
    })
    if (!delayVms.length) return;
    clearTimeout(this.__delayTimer);
    this.__delayTimer = setTimeout(() => {
      delayVms.forEach(f => setState(f.vm, { [f.key]: this.data }))
    }, 360)
  }
}

module.exports = {
  Store,
  Page: createPage,
  Component: createComponent,
  setUpdateName: setUpdateName,
}
