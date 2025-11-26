import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";
import store from "./store/index.js";
import "./plugins/axios.js";
import "material-symbols";
import vuetify from "./plugins/vuetify";
import "vue3-toastify/dist/index.css";

const app = createApp(App);

app.use(store);
app.use(router);
app.use(vuetify);
app.mount("#app");
