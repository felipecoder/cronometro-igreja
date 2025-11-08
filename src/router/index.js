// src/router/index.js
import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../HomeView.vue";
import ProjectorView from "../ProjectorView.vue";

const routes = [
    { path: "/", component: Home },
    { path: "/projector", component: ProjectorView },
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
});
