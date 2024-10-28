// main.ts

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import FontAwesome from './plugins/font-awesome';

createApp(App)
    .use(router)
    .use(FontAwesome)
    .mount('#app')
