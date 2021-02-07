import 'application.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

document.addEventListener('DOMContentLoaded', () => {
  createApp(App).use(router).mount(document.body);
});
