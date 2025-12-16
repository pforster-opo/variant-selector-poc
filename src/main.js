import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import VariantSelector from './VariantSelector.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/p/:bpCode', component: VariantSelector, props: true },
    ]
});

const app = createApp(App);
app.use(router);
app.mount('#app')
