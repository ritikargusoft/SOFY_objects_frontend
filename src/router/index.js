import { createRouter, createWebHistory } from "vue-router";
import homeRoutes from "./home.routes.js";
import objectsRoutes from "./objects.routes.js";
const routes = [
  ...homeRoutes,
  ...objectsRoutes,
  { path: "/", redirect: "/home" },
  { path: "/:pathMatch(.*)*", redirect: "/home" },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
