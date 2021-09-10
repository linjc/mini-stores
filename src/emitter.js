// 事件监听器
export default class Emitter {

  constructor() {
    this.events = {}
  }

  // setStore = (options, value) => {
  //   if (typeof options === 'object') {
  //     for (let key in options) {
  //       this.setStore(key, options[key])
  //     }
  //     return
  //   }
  //   this[options] = value
  //   this.emit(options + 'Change')
  // }

  on(event, listener) {
    if (typeof listener !== 'function') {
      console.error('参数不合法，请传入函数格式')
      return
    }

    event = event.toLowerCase()

    if (!this.events[event]) {
      this.events[event] = []
    }

    this.events[event].push(listener)

    return this
  }

  off(event, listener) {
    if (typeof listener !== 'function') {
      console.error('参数不合法，请传入函数格式')
      return
    }

    event = event.toLowerCase()

    let listeners = this.events[event]

    if (!listeners) {
      return this
    }

    let i = listeners.length - 1
    while (i >= 0) {
      if (listeners[i] === listener) {
        listeners.splice(i, 1)
        break
      }
      i--
    }

    if (listeners.length === 0) {
      delete this.events[event]
    }

    return this
  }

  emit(event, ...args) {
    event = event.toLowerCase()

    let listeners = this.events[event]

    if (!listeners || !listeners.length) {
      return this
    }

    listeners = listeners.slice(0)

    listeners.forEach(fn => fn.apply(this, args))

    return this
  }
}
