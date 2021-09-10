// 全局store

class Store {

  data = {
    language: "zh_cn",
    userName: '李狗蛋',
    corpName: '富土康化肥厂',
    // 函数属性
    description() {
      return `我是${this.userName}，我在${this.corpName}工作`
    },
    a: {
      b: {
        // 深层嵌套函数属性
        c() {
          return this.language + this.description
        }
      }
    }
  }

  onChangeLang() {
    if(this.data.language === 'zh_cn') {
      this.data.language = 'en_US'
    } else {
      this.data.language = 'zh_cn'
    }
    this.update()
  }
}

export default new Store();