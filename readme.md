# mini-stores - 小程序多状态管理

- [mini-smooth-signature](https://github.com/linjc/mini-smooth-signature) 小程序带笔锋手写签名，支持多平台小程序使用

---

- [前言](#前言)
- [安装](#安装)
- [API](#api)
- [使用](#使用)
  - [创建store](#创建store)
  - [创建页面](#创建页面)
  - [创建组件](#创建组件)
  - [视图上使用](#视图上使用)
  - [更新状态](#更新状态)
- [使用建议](#使用建议)
- [快捷链接](#快捷链接)

## 前言
公司好几款产品使用钉钉小程序开发，和其他平台小程序一样，都没有官方实现的状态管理库，用过redux、vuex、mobx等状态管理库的前端小伙伴都知道，状态管理能很轻松帮我们解决很多跨页面跨组件通信问题。一开始写了一个[Emitter](./src/emitter.js)，用事件监听方式去实现全局状态管理，但这种方式相对繁琐且不够直观。于是网上寻找有没有更好的解决方案，最终找到了[westore](https://github.com/Tencent/westore)库，这是由腾讯开源团队研发的微信小程序解决方案，其中针对状态管理的实现很不错，而且还使用专门为小程序开发的[JSON Diff 库](https://github.com/Tencent/westore/blob/v1/utils/diff.js)保证每次以最小的数据量更新状态，比原生setData的性能更好。但由于各平台小程序框架API存在一些差异，还需要改动一下才可以使用，于是在看了源码之后，基于其核心原理重写了一版，并去除了一些其他功能，只保留状态管理部分，总代码量从500行精简到了200行，另外根据自身理解做了如下改进：

### 1、优化渲染效率
每次更新store状态的时候，只对当前页面进行渲染，其他后台态页面只在再次显示的时候进行更新。这样可以大大减少同时setData的频次，提高渲染效率。

### 2、支持多平台
支持微信/支付宝/钉钉/百度/字节/QQ/京东等小程序使用。

多平台主要是兼容组件生命周期写法，对于其他小程序，只要组件生命周期函数和以上任意一个平台小程序相同，理论上也可以直接拿来用，使用时可自行验证。

### 3、支持多例store
westore采用的是单例store，即全局只使用一个store，在大项目实际使用中，会存在一些问题：
* **性能问题**。因为每次更新时都会使用diff库进行数据深度比对，如果全局只用一个store，那每次都会进行全量数据比对，也就是说项目状态越多，比对耗时就越长，虽然diff库性能非常好，但如果能做到极致，岂不美哉。
* **不够简洁**。为了方便管理，大的项目，可能会拆分更多的js文件，westore的方案是将拆分的模块合并到store上，合并时需要多自定义一个字段承载，这样绑定到视图上时，取值链路会变长，如果字段名比较长或者数据层级比较深，视图代码会比较冗长，不够美观。
  

**mini-stores添加支持多例store，可以定义各种各样独立的页面/领域store，无需二次组合，使用时在页面/组件上按需引入即可，非常灵活，且视图绑定也少一层字段嵌套，代码也会简洁些。**


## 安装
``` js
npm i mini-stores --save
```
也可以手动下载src/index.js文件放在项目中引用

## API
API就几个，非常容易上手。对小程序代码零破坏零侵入性，新老项目都可随时使用。
* **create.Page(stores, option)** [创建页面](#创建页面)
* **create.Component(stores, option)** [创建组件](#创建组件)
* **create.setUpdateName(name)** 自定义更新状态的函数名，默认值update
* **this.update()** 更新状态触发渲染，在页面、组件、store内使用
* **store.update()** 其他js文件中使用，需要引入相应的store

## 使用

#### 创建store

store其实是一个包含data属性的对象，可以使用任意方式来定义该对象，并支持函数计算属性（计算属性中的this指向store.data对象）
``` js
class Store {

  data = {
    title: '小程序多状态管理',
    language: "zh_cn",
    userName: '李狗蛋',
    deptName: '化肥质检部门',
    corpName: '富土康化肥厂',
    // 函数属性 - 可直接绑定到视图上
    description() {
      return `我是${this.userName}，我在${this.corpName}工作`
    },
    a: {
      b: {
        // 深层嵌套也支持函数属性
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

export default new Store()
``` 

#### 创建页面

使用create.Page(stores, option)创建页面。其中stores是一个对象，用来关联对应的store，以及定义该store在视图上使用的key名。

注意：该key在视图上使用时，并不是对应store，而是store.data值。另外定义key名注意不要和现有的私有变量同名，个人建议可以加个前缀（如$），这样可以一眼区分它来自全局状态。

``` js
import create from 'mini-stores'
import globalStore from '/stores/globalStore'
import indexStore from '/stores/indexStore'

// 字段名可随意命名，但注意不要和页面data内的私有变量同名
const stores = {
  '$index': indexStore, // 视图上使用$index.xxx即对应indexStore.data.xxx的值。
  '$data': globalStore, // 同上
}

create.Page(stores, {
  data: {
    privateData: '私有状态'
  },
  handleChangeTitle() {
    globalStore.data.title = '新标题'
    this.update() // 也可使用globalStore.update()
  },
  handleChangeName() {
    indexStore.changeName()
    this.update() // 如果changeName方法内调用了update方法，此处可以省去调用this.update()
  }
});
```

#### 创建组件

使用create.Component(stores, option)创建组件。使用和create.Page一样。


``` js
import create from 'mini-stores'
import globalStore from '/stores/globalStore'
import indexStore from '/stores/indexStore'

const stores = {
  '$index': indexStore,
  '$data': globalStore,
}

create.Component(stores, {
  data: {
    privateData: '私有状态'
  },
  methods: {
    handleChangeTitle() {
      globalStore.data.title = '新标题'
      this.update()
    },
    handleChangeName() {
      indexStore.changeName()
    }
  }
});
```

#### 视图上使用
简单示例：
``` js
<view>
  <view>{{$index.title}}</view>
  <view>{{$data.language}}</view>
  <view>{{$data.description}}</view>
  <view>{{$index.a.b.c}}</view>
  <view>{{privateData}}<view>
</view>
```

#### 更新状态

直接更改对应store.data内的值，最后调用this.upadte()即可（update名称可自定义，默认值update）。


注：更新状态的函数update(可使用setUpdateName自定义)，会自动注入到store和使用store的页面、组件对象上，所以在store、页面、组件对象上不要定义同名属性，避免覆盖
``` js
// 可在入口app.js自定义用于更新状态的函数名称，默认为update
import create from 'mini-stores'
create.setUpdateName('update2')
```
``` js
// 页面、组件内使用
store.data.language = 'zh_cn'
store.data.userName = '李狗蛋'
store.data.userList[0].name = '张三疯'
this.update() // 或使用store.update()
```
``` js
// store内使用
this.data.language = 'zh_cn'
this.data.userName = '李狗蛋'
this.data.userList[0].name = '张三疯'
this.update()
```
``` js
// 其他js文件使用
import store from '/stores/store'
store.data.language = 'zh_cn'
store.data.userName = '李狗蛋'
store.data.userList[0].name = '张三疯'
store.update()
```
## 使用建议
1、不一定非要使用全局状态管理，涉及到跨页面组件通信时，再考虑使用也可。

2、使用时，建议将状态和逻辑提取到store上，页面只负责处理用户事件的监听和回调，这样的好处是：
* 保持页面代码简洁，可以快速对页面的用户事件一目了然，更好把控业务。
* 状态逻辑在独立的js上，方便实现逻辑复用，且更易于代码测试，对使用函数式编程非常友好。


以上是个人见解，在使用过程中有什么问题或建议可以在**Issues**进行反馈，或钉钉联系：linjinchun

## 快捷链接

- [Example示例](./examples)
- [Github仓库](https://github.com/linjc/mini-stores)
- [Gitee仓库](https://gitee.com/l2j2c3/mini-stores)
