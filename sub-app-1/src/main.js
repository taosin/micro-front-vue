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