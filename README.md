# micro-front-vue
本文介绍 Vue 项目如何实现前端微服务

## 一、前言

### 什么是微前端

> Techniques, strategies and recipes for building a modern web app with multiple teams that can ship features independently. -- Micro Frontends
> 
> 微前端是一种多个团队通过独立发布功能的方式来共同构建现代化 web 应用的技术手段及方法策略。

更多关于微前端的相关介绍，推荐大家可以去看这几篇文章：

*   [Micro Frontends](https://micro-frontends.org/)
*   [Micro Frontends from martinfowler.com](https://martinfowler.com/articles/micro-frontends.html)
*   [可能是你见过最完善的微前端解决方案](https://zhuanlan.zhihu.com/p/78362028)
*   [微前端的核心价值](https://zhuanlan.zhihu.com/p/95085796)

### qiankun

qiankun 是蚂蚁金服开源的一套完整的微前端解决方案。具体描述可查看 [文档](https://qiankun.umijs.org/zh/) 和 [Github](https://github.com/umijs/qiankun)。

下面将通过一个微服务Demo 介绍 Vue 项目如何接入 qiankun，代码地址：[micro-front-vue]([https://github.com/taosin/micro-front-vue](https://github.com/taosin/micro-front-vue))

## 二、配置主应用

1.  使用 vue cli 快速创建主应用；
2.  安装 qiankun

```bash
$ yarn add qiankun # 或者 npm i qiankun -S
```

3.  调整主应用 `main.js` 文件：具体如下：

```js
import Vue from "vue"
import App from "./App.vue"
import router from "./router"

import { registerMicroApps, setDefaultMountApp, start } from "qiankun"
Vue.config.productionTip = false
let app = null;
/**
 * 渲染函数
 * appContent 子应用html内容
 * loading 子应用加载效果，可选
 */
function render({ appContent, loading } = {}) {
	if (!app) {
		app = new Vue({
			el: "#container",
			router,
			data() {
				return {
					content: appContent,
					loading
				};
			},
			render(h) {
				return h(App, {
					props: {
						content: this.content,
						loading: this.loading
					}
				});
			}
		});
	} else {
		app.content = appContent;
		app.loading = loading;
	}
}

/**
 * 路由监听
 * @param {*} routerPrefix 前缀
 */
function genActiveRule(routerPrefix) {
	return location => location.pathname.startsWith(routerPrefix);
}

function initApp() {
	render({ appContent: '', loading: true });
}

initApp();

// 传入子应用的数据
let msg = {
	data: {
		auth: false
	},
	fns: [
		{
			name: "_LOGIN",
			_LOGIN(data) {
				console.log(`父应用返回信息${data}`);
			}
		}
	]
};
// 注册子应用
registerMicroApps(
	[
		{
			name: "sub-app-1",
			entry: "//localhost:8091",
			render,
			activeRule: genActiveRule("/app1"),
			props: msg
		},
		{
			name: "sub-app-2",
			entry: "//localhost:8092",
			render,
			activeRule: genActiveRule("/app2"),
		}
	],
	{
		beforeLoad: [
			app => {
				console.log("before load", app);
			}
		], // 挂载前回调
		beforeMount: [
			app => {
				console.log("before mount", app);
			}
		], // 挂载后回调
		afterUnmount: [
			app => {
				console.log("after unload", app);
			}
		] // 卸载后回调
	}
);

// 设置默认子应用,与 genActiveRule中的参数保持一致
setDefaultMountApp("/app1");

// 启动
start();

```
4.  修改主应用 index.html 中绑定的 `id` ，需与 `el`  绑定 dom 为一致;
5.  调整 App.vue 文件，增加渲染子应用的盒子:

```vue
<template>
  <div id="main-root">
    <!-- loading -->
    <div v-if="loading">loading</div>
    <!-- 子应用盒子 -->
    <div id="root-view" class="app-view-box" v-html="content"></div>
  </div>
</template>

<script>
export default {
  name: "App",
  props: {
    loading: Boolean,
    content: String
  }
};
</script>

```

6.  创建 vue.config.js 文件，设置 `port` :

```js
module.exports = {
	devServer: {
		port: 8090
	}
}
```

## 三、配置子应用

1.  在主应用同一级目录下快速创建子应用,子应用无需安装 qiankun
2.  配置子应用 main.js:

```js
import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import routes from './router';
import './public-path';

Vue.config.productionTip = false;

let router = null;
let instance = null;

function render() {
	router = new VueRouter({
		base: window.__POWERED_BY_QIANKUN__ ? '/app1' : '/',
		mode: 'history',
		routes,
	});

	instance = new Vue({
		router,
		render: h => h(App),
	}).$mount('#app');
}

if (!window.__POWERED_BY_QIANKUN__) {
	render();
}

export async function bootstrap() {
	console.log('vue app bootstraped');
}

export async function mount(props) {
	console.log('props from main app', props);
	render();
}

export async function unmount() {
	instance.$destroy();
	instance = null;
	router = null;
}
```

3.  配置 vue.config.js

```js
const path = require('path');
const { name } = require('./package');

function resolve(dir) {
	return path.join(__dirname, dir);
}

const port = 8091; // dev port

module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
	outputDir: 'dist',
	assetsDir: 'static',
	filenameHashing: true,
	// tweak internal webpack configuration.
	// see https://github.com/vuejs/vue-cli/blob/dev/docs/webpack.md
	devServer: {
		// host: '0.0.0.0',
		hot: true,
		disableHostCheck: true,
		port,
		overlay: {
			warnings: false,
			errors: true,
		},
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
	},
	// 自定义webpack配置
	configureWebpack: {
		resolve: {
			alias: {
				'@': resolve('src'),
			},
		},
		output: {
			// 把子应用打包成 umd 库格式
			library: `${name}-[name]`,
			libraryTarget: 'umd',
			jsonpFunction: `webpackJsonp_${name}`,
		},
	},
};
```

其中有个需要注意的点：

1.  **子应用必须支持跨域**：由于 qiankun 是通过 fetch 去获取子应用的引入的静态资源的，所以必须要求这些静态资源支持跨域；
2.  使用 webpack 静态 publicPath 配置：可以通过两种方式设置，一种是直接在 mian.js 中引入 public-path.js 文件，一种是在开发环境直接修改 vue.config.js:

```js
{
  output: {
    publicPath: `//localhost:${port}`;
  }
}
```

**public-path.js 内容如下：**

```js
if (window.__POWERED_BY_QIANKUN__) {
  // eslint-disable-next-line no-undef
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
}
```

> 至此，Vue 项目的前端微服务已经简单完成了。


但是在实际的开发过程中，并非如此简单，同时还存在应用间跳转、应用间通信等问题。
