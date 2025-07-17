import { createApp } from "vue";
import "./assets/style.css";
import App from "./App.vue";
import router from "./router";
import clickOutsideDirective from './directives/clickOutside.js';

// 1. Buat instance aplikasi DULU
const app = createApp(App);

// 2. SETELAH app dibuat, baru gunakan untuk mendaftarkan plugin dan direktif
app.use(router);
app.directive('click-outside', clickOutsideDirective); // <-- Pindahkan ke sini

// 3. Terakhir, mount aplikasi ke DOM
app.mount("#app");