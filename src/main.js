import { createApp } from "vue";
import { router } from "./router";
import App from "./App.vue";
import "./index.css";
import { createPinia } from "pinia";
import { useThemeStore } from "./stores/theme";

const app = createApp(App);
app.use(router);
app.use(createPinia());
app.mount("#app");

const themeStore = useThemeStore();
themeStore.setTheme(themeStore.theme);
