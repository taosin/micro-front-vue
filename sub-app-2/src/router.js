import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
	{
		path: '/',
		name: 'home',
		redirect: 'table'
	},
	{
		path: '/form',
		name: 'form',
		// route level code-splitting
		// this generates a separate chunk (about.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		component: () => import(/* webpackChunkName: "about" */ '@/views/form.vue'),
	},
	{
		path: '/table',
		name: 'table',
		component: () => import(/* webpackChunkName: "table" */ '@/views/table.vue'),
	},
];

export default routes;