# mini-stores - 小程序多状态管理

- [前言](#前言)
- [安装](#安装)
- [使用](#使用)
  - [创建store](#创建store)
  - [页面内使用](#页面内使用)
  - [组件内使用](#组件内使用)
  - [视图上使用](#视图上使用)
  - [更新状态](#更新状态)
- [使用建议](#使用建议)
- [快捷链接](#快捷链接)

## 前言
小程序没有官方实现的状态管理库，用过redux、vuex、mobx等状态管理库的前端小伙伴都知道，状态管理能很轻松帮我们解决很多跨页面跨组件通信问题。一开始写了一个Emitter类，用事件监听方式去实现全局状态管理，但这种方式相对繁琐且不够直观。于是网上寻找有没有更好的解决方案，最终找到了[westore](https://github.com/Tencent/westore/tree/v1)库，这是由腾讯开源团队研发的微信小程序解决方案，其中针对状态管理的实现很不错，而且还使用专门为小程序开发的[JSON Diff 库](https://github.com/Tencent/westore/blob/v1/utils/diff.js)保证每次以最小的数据量更新状态，比原生setData的性能更好。但由于不支持同时多例store及私有状态等，于是在看了源码之后，基于其核心原理重写了一版，另外根据自身理解做了如下改进：

### 1、优化渲染效率
每次更新store状态的时候，只对当前页面进行渲染，其他后台态页面延迟更新。这样可以大大减少同时setData的频次，提高渲染效率。

### 2、支持多例store
一个页面或者组件可以同时使用多个store，且不破坏原有私有状态的定义。

### 3、支持多平台
支持微信/支付宝/钉钉/百度/字节/抖音/QQ/京东等小程序使用。对于其他小程序，理论上也可以直接拿来用，使用时可自行验证。


## 安装
``` js
npm i mini-stores --save
```

## 使用

#### 创建store

store继承于mini-stores提供的Store类，其中状态定义在data对象内，并支持函数计算属性（计算属性中的this指向store.data对象）
``` js
const create = require('mini-stores')

class Store extends create.Store {

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

#### 页面内使用

在页面的初始化时（onLoad）绑定store，页面销毁时（onUnload）解除store绑定。

store.bind方法使用：store.bind(this, '$data'), 第一个参数this为当前页面实例，第二参数为该store在视图上使用的key名。注意该key在视图上使用时，并不是对应store，而是store.data值。另外定义key名注意不要和现有的私有变量同名，个人建议可以加个前缀（如$），这样可以一眼区分它来自全局状态。

另外如果页面是Tabbar页面，需要在show时手动update触发更新，这是由于小程序Tabbar页面切出后不会保留在页面栈中，使得stores无法跟踪更新。

``` js
import globalStore from '/stores/globalStore'
import indexStore from '/stores/indexStore'

Page({
  data: {
    privateData: '私有状态' // 私有状态还是通过原有的setData更新
  },
  onLoad() {
    // 绑定实例到store上，第二参数定义视图上使用的key名，命名随意，但注意不要和页面data内的私有变量同名
    indexStore.bind(this, '$index');
    globalStore.bind(this, '$data');
  },
  // 页面销毁时解除绑定
  onUnload() {
    indexStore.unbind(this)
    globalStore.unbind(this)
  },
  // 该页面如果是Tabbar页面，需要在show时手动update触发更新。
  onShow() {
    indexStore.update()
    globalStore.update()
  },
  handleChangeTitle() {
    globalStore.data.title = '新标题'
    globalStore.update()
  },
  handleChangeName() {
    indexStore.changeName()
    indexStore.update() // 如果changeName方法内调用了this.update方法，此处可以省去调用indexStore.update()
  }
});
```

#### 组件内使用

和页面内使用一样，在组件初始化时进行store绑定，在组件销毁时解除绑定。另外如果组件在Tabbar页面使用，需要在show时手动写update触发更新，如果只用于其他页面则不需要，当然写了也不影响。

各平台组件生命周期函数写法可能有所区别，根据对应官方文档来写即可。


``` js
import globalStore from '/stores/globalStore'
import indexStore from '/stores/indexStore'

Component({
  data: {
    privateData: '私有状态'
  },
  // 阿里系小程序
  didMount() {
    indexStore.bind(this, '$index');
    globalStore.bind(this, '$data');
  },
  didUnmount() {
    // 组件销毁时解除绑定
    indexStore.unbind(this)
    globalStore.unbind(this)
  },

  // 微信小程序等大部分小程序
  lifetimes: {
    ready() {
      indexStore.bind(this, '$index');
      globalStore.bind(this, '$data');
    },
    detached() {
      // 组件销毁时解除绑定
      helloStore.unbind(this)
      globalStore.unbind(this)
    },
  },
  // 组件用于Tabbar页面内，需要在show时手动update触发更新。（如果不用于Tabbar页面可以不写，当然留着也不影响）
  pageLifetimes: {
    show() {
      indexStore.update()
      globalStore.update()
    },
  },
  methods: {
    handleChangeTitle() {
      globalStore.data.title = '新标题'
      globalStore.update()
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

直接更改对应store.data内的值，最后调用store.upadte()即可。

注：store对象上不要重新定义update属性，避免覆盖

## 使用建议
1、不一定非要使用全局状态管理，涉及到跨页面组件通信时，再考虑使用也可，mini-stores对小程序代码零破坏性，可随时加入或去掉。

2、使用时，建议将状态和逻辑提取到store上，页面只负责处理用户事件的监听和回调，这样的好处是：
* 保持页面代码简洁，可以快速对页面的用户事件一目了然，更好把控业务。
* 状态逻辑在独立的js上，方便实现逻辑复用，且更易于代码测试，对使用函数式编程非常友好。


使用过程中有什么问题或建议可以在**Issues**进行反馈

## 快捷链接

- [Example示例](./examples)
- [Github仓库](https://github.com/linjc/mini-stores)
- [Gitee仓库](https://gitee.com/l2j2c3/mini-stores)
